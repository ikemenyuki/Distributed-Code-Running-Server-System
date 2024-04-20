
import threading
import logging
import time
import config

from jobObjects import RedisDict, RedisQueue, DCRSSJob

from datetime import datetime

class JobQueue(object):
    def __init__(self, level=logging.DEBUG):
        logging.basicConfig(level=level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        self.log = logging.getLogger("JobQueue")
        self.queueLock = threading.Lock()
        self.liveJobs = RedisDict("liveJobs")
        self.deadJobs = RedisDict("deadJobs")
        self.unassignedJobs = RedisQueue("unassignedLiveJobs")
    
        self.nextID = 1

    def _getNextID(self):
        self.log.debug("_getNextID|Acquiring lock to job queue.")
        self.queueLock.acquire()
        self.log.debug("_getNextID|Acquired lock to job queue.")
        id = self.nextID

        keys = self.liveJobs.keys()
        if str(id) in keys:
            id = -1
            for i in range(1, config.MAX_JOBID + 1):
                if str(i) not in keys:
                    id = i
                    break

        self.nextID += 1
        if self.nextID > config.MAX_JOBID:
            # Wrap around if job ids go over max job ids avail
            self.nextID = 1
        self.queueLock.release()
        self.log.debug("_getNextID|Released lock to job queue.")
        return id

    def remove(self, id):
        """remove - Remove job from live queue"""
        status = -1
        self.log.debug("remove|Acquiring lock to job queue.")
        self.queueLock.acquire()
        self.log.debug("remove|Acquired lock to job queue.")
        if id in self.liveJobs:
            self.liveJobs.delete(id)
            status = 0
        self.unassignedJobs.remove(int(id))

        self.queueLock.release()
        self.log.debug("remove|Relased lock to job queue.")

        if status == 0:
            self.log.debug("Removed job %s from queue" % id)
        else:
            self.log.error("Job %s not found in queue" % id)
        return status

    def add(self, job):
        """add - add job to live queue
        This function assigns an ID number to a *new* job and then adds it
        to the queue of live jobs.
        Returns the job id on success, -1 otherwise
        """
        if not isinstance(job, DCRSSJob):
            return -1

        # Get an id for the new job
        self.log.debug("add|Getting next ID")
        nextId = self._getNextID()
        if nextId == -1:
            self.log.info("add|JobQueue is full")
            return -1
        job.setId(nextId)
        self.log.debug("add|Gotten next ID: " + str(job.id))

        self.log.info("add|Unassigning job ID: %d" % (job.id))
        # Make the job unassigned
        job.makeUnassigned()

        # Add the job to the queue. Careful not to append the trace until we
        # know the job has actually been added to the queue.
        self.log.debug("add|Acquiring lock to job queue.")
        self.queueLock.acquire()
        self.log.debug("add| Acquired lock to job queue.")

        # Adds the job to the live jobs dictionary
        self.liveJobs.set(job.id, job)

        # Add this to the unassigned job queue too
        self.unassignedJobs.put(int(job.id))

        # job.appendTrace(
        #     "%s|Added job %s:%d to queue"
        #     % (datetime.utcnow().ctime(), job.name, job.id)
        # )

        self.log.debug("Ref: " + str(job._remoteLocation))
        self.log.debug("job_id: " + str(job.id))
        self.log.debug("job_name: " + str(job.name))

        self.queueLock.release()
        self.log.debug("add|Releasing lock to job queue.")

        self.log.info(
            "Added job %s:%s to queue, details = %s"
            % (job.name, job.id, str(job.__dict__))
        )

        return str(job.id)

    def addDead(self, job):
        """addDead - add a job to the dead queue.
        Called by validateJob when a job validation fails.
        Returns -1 on failure and the job id on success
        """
        if not isinstance(job, DCRSSJob):
            return -1

        # Get an id for the new job
        self.log.debug("add|Getting next ID")
        nextId = self._getNextID()
        if nextId == -1:
            self.log.info("add|JobQueue is full")
            return -1
        job.setId(nextId)
        self.log.debug("addDead|Gotten next ID: " + str(job.id))

        self.log.info("addDead|Unassigning job %s" % str(job.id))
        job.makeUnassigned()
        job.retries = 0

        self.log.debug("addDead|Acquiring lock to job queue.")
        self.queueLock.acquire()
        self.log.debug("addDead|Acquired lock to job queue.")

        # We add the job into the dead jobs dictionary
        self.deadJobs.set(job.id, job)
        self.queueLock.release()
        self.log.debug("addDead|Released lock to job queue.")

        return job.id

    def delJob(self, id, deadjob):
        """delJob - Implements delJob() interface call
        @param id - The id of the job to remove
        @param deadjob - If 0, move the job from the live queue to the
        dead queue. If non-zero, remove the job from the dead queue
        and discard.
        """
        status = -1
        if deadjob == 0:
            try:
                # Remove the job from the unassigned live jobs queue, if it
                # is yet to be assigned.
                self.unassignedJobs.remove(int(id))
            except ValueError:
                # Forbid deleting a job that has already been assigned
                self.log.info("delJob | Job ID %s was already assigned" % (id))
                return status

            return self.makeDead(id, "Requested by operator")
        else:
            self.queueLock.acquire()
            self.log.debug("delJob| Acquired lock to job queue.")
            if id in self.deadJobs:
                self.deadJobs.delete(id)
                status = 0
            self.queueLock.release()
            self.log.debug("delJob| Released lock to job queue.")

            if status == 0:
                self.log.debug("Removed job %s from dead queue" % id)
            else:
                self.log.error("Job %s not found in dead queue" % id)
            return status

    def get(self, id):
        """get - retrieve job from live queue
        @param id - the id of the job to retrieve
        """
        self.queueLock.acquire()
        self.log.debug("get| Acquired lock to job queue.")
        job = self.liveJobs.get(id)
        self.queueLock.release()
        self.log.debug("get| Released lock to job queue.")
        return job

    def assignJob(self, jobId):
        """assignJob - marks a job to be assigned"""
        self.queueLock.acquire()
        self.log.debug("assignJob| Acquired lock to job queue.")

        job = self.liveJobs.get(jobId)

        # Remove the current job from the queue
        self.unassignedJobs.remove(int(jobId))

        self.log.debug("assignJob| Retrieved job.")
        self.log.info("assignJob|Assigning job ID: %s" % str(job.id))
        job.makeAssigned()

        self.log.debug("assignJob| Releasing lock to job queue.")
        self.queueLock.release()
        self.log.debug("assignJob| Released lock to job queue.")
        # return job

    def unassignJob(self, jobId):
        """unassignJob - marks a job to be unassigned
        Note: We assume here that a job is to be rescheduled or
        'retried' when you unassign it. This retry is done by
        the worker.
        """
        self.queueLock.acquire()
        self.log.debug("unassignJob| Acquired lock to job queue.")

        # Get the current job
        job = self.liveJobs.get(jobId)

        self.log.info("unassignJob|Unassigning job %s" % str(job.id))
        job.makeUnassigned()

        # Since the assumption is that the job is being retried,
        # we simply add the job to the unassigned jobs queue without
        # removing anything from it
        self.unassignedJobs.put(int(jobId))

        self.queueLock.release()
        self.log.debug("unassignJob| Released lock to job queue.")

    def makeDead(self, id, reason):
        """makeDead - move a job from live queue to dead queue"""
        self.log.info("makeDead| Making dead job ID: " + str(id))
        self.queueLock.acquire()
        self.log.debug("makeDead| Acquired lock to job queue.")
        status = -1
        # Check to make sure that the job is in the live jobs queue
        if id in self.liveJobs:
            self.log.info("makeDead| Found job ID: %s in the live queue" % (id))
            status = 0
            job = self.liveJobs.get(id)
            self.log.info("Terminated job %s:%s: %s" % (job.name, job.id, reason))
            # Add the job to the dead jobs dictionary
            self.deadJobs.set(id, job)
            # Remove the job from the live jobs dictionary
            self.liveJobs.delete(id)

            # unassign, remove from unassigned jobs queue
            job.makeUnassigned()
            self.unassignedJobs.remove(int(id))

            # job.appendTrace("%s|%s" % (datetime.utcnow().ctime(), reason))
        self.queueLock.release()
        self.log.debug("makeDead| Released lock to job queue.")
        return status

    def getInfo(self):

        info = {}
        info["size"] = len(self.liveJobs.keys())
        info["size_deadjobs"] = len(self.deadJobs.keys())
        info["size_unassignedjobs"] = self.unassignedJobs.qsize()

        return info

    def reset(self):
        """reset - resets and clears all the internal dictionaries
        and queues
        """
        self.liveJobs._clean()
        self.deadJobs._clean()
        self.unassignedJobs._clean()

    def getNextPendingJob(self):
        """Gets the next unassigned live job. Note that this is a
        blocking function and we will block till there is an available
        job.
        """
        # Blocks till the next item is added
        id = self.unassignedJobs.get()

        self.log.debug("_getNextPendingJob|Acquiring lock to job queue.")
        self.queueLock.acquire()
        self.log.debug("_getNextPendingJob|Acquired lock to job queue.")

        # Get the corresponding job
        job = self.liveJobs.get(id)
        if job is None:
            raise Exception("Cannot find unassigned job in live jobs")

        self.log.debug("getNextPendingJob| Releasing lock to job queue.")
        self.queueLock.release()
        self.log.debug("getNextPendingJob| Released lock to job queue.")
        return job