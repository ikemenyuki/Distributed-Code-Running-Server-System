
import copy
import time
import logging
import threading
import kubernetes
import config

from launchJob import createJob, monitorJob
from datetime import datetime
from jobQueue import JobQueue


class JobManager(object):
    def __init__(self, queue, level=logging.DEBUG):
        kubernetes.config.load_incluster_config()
        logging.basicConfig(level=level,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        self.log = logging.getLogger("JobManager")
        self.daemon = True
        self.running = False
        self.jobQueue = queue
        
        self.nextId = 10000

    def start(self):
        if self.running:
            return
        thread = threading.Thread(target=self.__manage)
        thread.daemon = True
        thread.start()

    def run(self):
        if self.running:
            return
        self.__manage()

    def __manage(self):
        self.running = True
        while True:
            # Blocks until we get a next job
            job = self.jobQueue.getNextPendingJob()
            self.log.info("Dispatched job %s:%d" % (job.name, job.id))
            self.jobQueue.assignJob(job.id)
            threading.Thread(target=self.workerThread, args=(config.WORKER_IMAGE, job)).start()

    def workerThread(self, image, job):
        command = self.__generateRunCommand(job)
        jname = ('%s-%s' % (job.name, job.date)).lower()
        try:
            createJob(image, command, jname)
            monitor = monitorJob(jname)
            self.log.info("Job %s:%d finished with status %d" % (job.name, job.id, monitor))
            if (0 == monitor):
                self.jobQueue.makeDead(job.id, "Job finished successfully")
                # job.makeSuccess()
            else:
                self.jobQueue.makeDead(job.id, "job failed")
                # job.makeFailed()
            
        except Exception as err:
            self.jobQueue.makeDead(job.id, str(err))
            # job.makeFailed()

    # outfile = "/data/" + projectId + "/out-" + formatted_date
    # job_input = ["/bin/sh", "-c", "cd /data/" + projectId + " && " + " ".join(user_command) + ">" + job_outputFile + " 2>&1"]
    def __generateRunCommand(self, job):
        runCommandList = ["/bin/sh", "-c"]
        # Create the command string
        commands = [
            "cp -r /data/{name} /home/{name}".format(name=job.name),  # Copy data
            "cd /home/{name}".format(name=job.name),  # Change directory
            "{inputs} > out-{name}-{date} 2>&1".format(name=job.name, date=job.date, inputs=" ".join(job.input)),  # Execute job inputs and redirect output
            "cp out-{name}-{date} /data/{name}/out-{name}-{date}".format(name=job.name, date=job.date)  # Copy output back
        ]
        # Join all commands with '&&' ensuring all must succeed
        final_command = " ; ".join(commands)
        runCommandList.append(final_command)
        
        self.log.debug("Generated run command: %s" % runCommandList)
        return runCommandList

    