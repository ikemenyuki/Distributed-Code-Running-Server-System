
# this file is inspired by :
#   https://github.com/autolab/Tango/blob/master/tests/testObjects.py

import unittest
import redis
import config

from utils import RedisQueue

class TestRedisQueue(unittest.TestCase):
    def setUp(self):
        __db = redis.StrictRedis(config.REDIS_HOSTNAME, config.REDIS_PORT, db=0)
        # __db.flushall()
        self.test_entries = [i for i in range(10)]

    def addAllToQueue(self):
        # Add all items into the queue
        for x in self.test_entries:
            self.testQueue.put(x)
            self.expectedSize += 1
            self.assertEqual(self.testQueue.qsize(), self.expectedSize)

    def runQueueTests(self):
        self.testQueue = RedisQueue("self.testQueue")
        self.expectedSize = 0
        self.assertEqual(self.testQueue.qsize(), self.expectedSize)
        self.assertTrue(self.testQueue.empty())

        self.addAllToQueue()

        # Test the blocking get
        for x in self.test_entries:
            item = self.testQueue.get()
            self.expectedSize -= 1
            self.assertEqual(self.testQueue.qsize(), self.expectedSize)
            self.assertEqual(item, x)

        self.addAllToQueue()

        # Test the blocking get
        for x in self.test_entries:
            item = self.testQueue.get_nowait()
            self.expectedSize -= 1
            self.assertEqual(self.testQueue.qsize(), self.expectedSize)
            self.assertEqual(item, x)

        self.addAllToQueue()

        # Remove all the even entries
        for x in self.test_entries:
            if x % 2 == 0:
                self.testQueue.remove(x)
                self.expectedSize -= 1
                self.assertEqual(self.testQueue.qsize(), self.expectedSize)

        # Test that get only returns odd keys in order
        for x in self.test_entries:
            if x % 2 == 1:
                item = self.testQueue.get_nowait()
                self.expectedSize -= 1
                self.assertEqual(self.testQueue.qsize(), self.expectedSize)
                self.assertEqual(item, x)

if __name__ == "__main__":
    unittest.main()
