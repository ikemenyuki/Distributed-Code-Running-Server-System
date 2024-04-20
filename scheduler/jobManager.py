
import copy
import time
import logging
import threading
import kubernetes
import config

from launchJob import create_job, monitor_job
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

            try:
                self.log.info("Dispatched job %s:%d" % (job.name, job.id))
                # job.appendTrace(
                #     "%s|Dispatched job %s:%d"
                #     % (datetime.ctime(), job.name, job.id)
                # )
                self.jobQueue.assignJob(job.id)
                # create_job(config.WORKER_IMAGE, run_command=job.input, job_name=job.name)
                thread = threading.Thread(target=self.worker_thread, args=(config.WORKER_IMAGE, job))
                thread.start()

            except Exception as err:
                self.jobQueue.makeDead(job.id, str(err))
    
    
    def worker_thread(self, image, job):
        try:
            create_job(image, job.input, job.name)
            self.jobQueue.makeDead(job.id, "job created successfully")
        except Exception as e:
            print("Error occurred:", e)
