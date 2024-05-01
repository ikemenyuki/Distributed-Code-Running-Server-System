
# this file is inspired by :
#   https://github.com/autolab/Tango/blob/master/tests/testJobQueue.py

import unittest
import redis
import config

from jobQueue import JobQueue
from utils import DCRSSJob


class TestJobQueue(unittest.TestCase):
    def setUp(self):
        __db = redis.StrictRedis(config.REDIS_HOSTNAME, config.REDIS_PORT, db=0)
        # __db.flushall()

        self.job1 = DCRSSJob(
            name="sample_job_1",
            date="sample_date_1",
            input=["input_1"],
        )

        self.job2 = DCRSSJob(
            name="sample_job_2",
            date="sample_date_2",
            input=["input_2"],
        )

        self.jobQueue = JobQueue(None)
        self.jobQueue.reset()
        self.jobId1 = self.jobQueue.add(self.job1)
        self.jobId2 = self.jobQueue.add(self.job2)

    def test_job(self):
        self.job1.makeUnassigned()
        self.assertTrue(self.job1.isNotAssigned())

        job = self.jobQueue.get(self.jobId1)
        self.assertTrue(job.isNotAssigned())

        self.job1.makeAssigned()
        print("Checkout:")
        self.assertFalse(self.job1.isNotAssigned())
        self.assertFalse(job.isNotAssigned())

    def test_add(self):
        info = self.jobQueue.getInfo()
        self.assertEqual(info["size"], 2)

    def test_addToUnassigned(self):
        info = self.jobQueue.getInfo()
        self.assertEqual(info["size_unassignedjobs"], 2)

    def test_getNextPendingJob(self):
        self.jobQueue.assignJob(self.jobId2)
        # job 2 should have been removed from unassigned queue
        info = self.jobQueue.getInfo()
        self.assertEqual(info["size_unassignedjobs"], 1)
        self.jobQueue.assignJob(self.jobId1)
        info = self.jobQueue.getInfo()
        self.assertEqual(info["size_unassignedjobs"], 0)
        self.jobQueue.unassignJob(self.jobId1)
        info = self.jobQueue.getInfo()
        self.assertEqual(info["size_unassignedjobs"], 1)
        job = self.jobQueue.getNextPendingJob()
        self.assertMultiLineEqual(str(job.id), self.jobId1)

    def test_getNextPendingJob2(self):
        job = self.jobQueue.getNextPendingJob()
        self.assertMultiLineEqual(str(job.id), self.jobId1)
        job = self.jobQueue.getNextPendingJob()
        self.assertMultiLineEqual(str(job.id), self.jobId2)

    def test_assignJob(self):
        self.jobQueue.assignJob(self.jobId1)
        job = self.jobQueue.get(self.jobId1)
        self.assertFalse(job.isNotAssigned())

    def test_makeDead(self):
        info = self.jobQueue.getInfo()
        self.assertEqual(info["size_deadjobs"], 0)
        self.assertEqual(info["size_unassignedjobs"], 2)
        self.jobQueue.makeDead(self.jobId1, "test")
        info = self.jobQueue.getInfo()
        self.assertEqual(info["size_deadjobs"], 1)
        self.assertEqual(info["size_unassignedjobs"], 1)

    def test__getNextID(self):
        init_id = self.jobQueue.nextID
        for i in range(1, config.MAX_JOBID + 100):
            id = self.jobQueue._getNextID()
            self.assertNotEqual(str(id), self.jobId1)
        self.jobQueue.nextID = init_id


if __name__ == "__main__":
    unittest.main()
