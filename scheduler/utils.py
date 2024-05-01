
# this file is inspired by :
#   https://github.com/autolab/Tango/blob/master/tangoObjects.py

import redis
import config
import pickle

redisConnection = None

def getRedisConnection():
    global redisConnection
    if redisConnection is None:
        redisConnection = redis.StrictRedis(
            host=config.REDIS_HOSTNAME, port=config.REDIS_PORT, db=0
        )
        redisConnection.flushall()
        print("Redis data flushed on initial connection.")

    return redisConnection

class RedisDict(object):
    def __init__(self, object_name):
        self.r = getRedisConnection()
        self.hash_name = object_name

    def __contains__(self, id):
        return self.r.hexists(self.hash_name, str(id))

    def set(self, id, obj):
        pickled_obj = pickle.dumps(obj)

        if hasattr(obj, "_remoteLocation"):
            obj._remoteLocation = self.hash_name + ":" + str(id)

        self.r.hset(self.hash_name, str(id), pickled_obj)
        return str(id)

    def get(self, id):
        if id in self:
            unpickled_obj = self.r.hget(self.hash_name, str(id))
            obj = pickle.loads(unpickled_obj)
            return obj
        else:
            return None

    def keys(self):
        keys = map(lambda key: key.decode(), self.r.hkeys(self.hash_name))
        return list(keys)

    def values(self):
        vals = self.r.hvals(self.hash_name)
        valslist = []
        for val in vals:
            valslist.append(pickle.loads(val))
        return valslist

    def delete(self, id):
        self._remoteLocation = None
        self.r.hdel(self.hash_name, id)

    def _clean(self):
        self.r.delete(self.hash_name)

    def items(self):
        return iter(
            [
                (i, self.get(i))
                for i in range(1, config.MAX_JOBID + 1)
                if self.get(i) is not None
            ]
        )

class RedisQueue(object):

    def __init__(self, name, namespace="queue"):
        self.__db = getRedisConnection()
        self.key = "%s:%s" % (namespace, name)

    def qsize(self):
        return self.__db.llen(self.key)

    def empty(self):
        return self.qsize() == 0

    def put(self, item):
        pickled_item = pickle.dumps(item)
        self.__db.rpush(self.key, pickled_item)

    def get(self, block=True, timeout=None):
        if block:
            item = self.__db.blpop(self.key, timeout=timeout)
        else:
            item = self.__db.lpop(self.key)

        if item is None:
            return None

        if block and item:
            item = item[1]

        item = pickle.loads(item)
        return item

    def get_nowait(self):
        return self.get(False)

    def __getstate__(self):
        ret = {}
        ret["key"] = self.key
        return ret

    def __setstate__(self, dict):
        self.__db = getRedisConnection()
        self.__dict__.update(dict)

    def remove(self, item):
        items = self.__db.lrange(self.key, 0, -1)
        pickled_item = pickle.dumps(item)
        return self.__db.lrem(self.key, 0, pickled_item)

    def _clean(self):
        self.__db.delete(self.key)


class DCRSSJob(object):
    
    def __init__(
        self,
        name=None,
        date=None,
        input=[],
        timeout=0,
    ):  
        self.name = name
        self.date = date
        self.input = input
        self.timeout = timeout
        
        self.assigned = False
        self.status = False # True: success, False: failed
        self._remoteLocation = None
    
    def makeSuccess(self):
        print("makeSuccess")
        self.syncRemote()
        self.status = True
        self.updateRemote()
    
    def makeFailed(self):
        print("makeFailed")
        self.syncRemote()
        self.status = False
        self.updateRemote()
    
    def isFailed(self):
        self.syncRemote()
        return not self.status

    def makeAssigned(self):
        print("makeAssigned")
        self.syncRemote()
        self.assigned = True
        self.updateRemote()

    def makeUnassigned(self):
        print("makeUnassigned")
        self.syncRemote()
        self.assigned = False
        self.updateRemote()

    def isNotAssigned(self):
        self.syncRemote()
        return not self.assigned

    def setId(self, new_id):
        self.id = new_id
        if self._remoteLocation is not None:
            dict_hash = self._remoteLocation.split(":")[0]
            key = self._remoteLocation.split(":")[1]
            dictionary = RedisDict(dict_hash)
            dictionary.delete(key)
            self._remoteLocation = dict_hash + ":" + str(new_id)
            self.updateRemote()

    def syncRemote(self):
        if self._remoteLocation is not None:
            dict_hash = self._remoteLocation.split(":")[0]
            key = self._remoteLocation.split(":")[1]
            dictionary = RedisDict(dict_hash)
            temp_job = dictionary.get(key)
            self.updateSelf(temp_job)

    def updateRemote(self):
        if self._remoteLocation is not None:
            dict_hash = self._remoteLocation.split(":")[0]
            key = self._remoteLocation.split(":")[1]
            dictionary = RedisDict(dict_hash)
            dictionary.set(key, self)

    def updateSelf(self, other_job):
        self.name = other_job.name
        self.date = other_job.date
        self.input = other_job.input
        self.timeout = other_job.timeout
        self.assigned = other_job.assigned
        self.status = other_job.status