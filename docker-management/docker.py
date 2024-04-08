
# running code in the container
# this file is inspired by:
#   https://github.com/autolab/Tango/blob/master/vmms/localDocker.py

import os
import logging
import config
import subprocess
import time
import re

class DockerConfig(object):
    def __init__(
        self,
        name="DefaultDockerContainer",
        image=None,
        network=None,
        cores=4,
        memory=2048,
        volumn=None,
        id=None,
    ):
        self.name = name
        self.image = image
        self.network = network
        self.cores = cores
        self.memory = memory
        self.volumn = volumn
        self.id = id

    def __repr__(self):
        return "Docker container(name: %s, image: %s)" % (self.name, self.image)    
    
def timeout(command, timeout=5):
    """timeout - Run a unix command with a timeout. Return -1 on
    timeout, otherwise return the return value from the command, which
    is typically 0 for success, 1-255 for failure.
    """
    p = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    output, _ = p.communicate()

    t = 0.0
    while t < timeout and p.poll() is None:
        time.sleep(config.TIMER_POLL_INTERVAL)
        t += config.TIMER_POLL_INTERVAL

    if p.poll() is None:
        try:
            os.kill(p.pid, 9)
        except OSError:
            pass
        returncode = -1
    else:
        returncode = p.poll()
    return output.decode('utf-8'), returncode

class Docker(object):
    def __init__(self, conf=DockerConfig(), level=logging.DEBUG):
        try:
            logging.basicConfig(level=level,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
            self.log = logging.getLogger("Docker container")
            if len(config.DOCKER_VOLUME_PATH) == 0:
                raise Exception("DOCKER_VOLUME_PATH not defined in config.")
            
            self.conf = conf
            if self.startContainer()[1] != 0:
                raise Exception("Failed to start container.")
            self.isRunning = True

        except Exception as e:
            self.log.error(str(e))
            exit(1)
    
    def startContainer(self, runTimeout=3):
        """startContainer - Start the docker container in the background
            e.g. docker run -d --name test-instance -v /Users/tianxie/thesis/testcases/cpp/:/home/mount test1
        """
        args = ["docker", "run", "-d", "--name", conf.name, "-v"]
        args = args + ["%s:%s" % (conf.volumn, "/home/mount")] + [f"--cpus={conf.cores}"] + ["-m", f"{conf.memory}m"] \
                + ["--network", "none"] + [conf.image]
        self.log.debug("Starting container: %s" % str(args))
        out, ret = timeout(args, runTimeout * 2)
        self.log.debug("startContainer returning %d" % ret)

        return out, ret    
    
    def execute(self, commandList, runTimeout=3):
        """execute - execute a command to the docker container
            e.g. docker exec -it test-instance make
        """
        args = ["docker", "exec", "-it", conf.name]
        args = args + commandList
        
        self.log.debug("Executing command: %s" % str(args))
        out, ret = timeout(args, runTimeout * 2)
        self.log.debug("execution returning %d" % ret)

        return out, ret

    def stop(self, runTimeout=15):
        """stop - Stop the docker container
            e.g. docker stop test-instance
        """
        if not self.isRunning:
            self.log.info("Container is already stopped")
            return "", 1
        args = ["docker", "stop", conf.name]
        self.log.debug("Stopping container: %s" % str(args))
        out, ret = timeout(args, runTimeout * 2)
        self.log.debug("stopContainer returning %d" % ret)
        if ret == 0:
            self.isRunning = False

        return out, ret

    def resume(self, runTimeout=15):
        """resume - Resume the docker container
            e.g. docker start test-instance
        """
        if self.isRunning:
            self.log.info("Container is already running")
            return "", 1
        else:
            args = ["docker", "start", conf.name]
            self.log.debug("Resuming container: %s" % str(args))
            out, ret = timeout(args, runTimeout * 2)
            self.log.debug("resumeContainer returning %d" % ret)
            if ret == 0:
                self.isRunning = True
            
            return out, ret
    
    def cleanup(self, runTimeout=3):
        """cleanup - Stop and remove the docker container
            e.g. docker rm test-instance
        """
        args = ["docker", "rm", "-f", conf.name]
        self.log.debug("Cleaning up container: %s" % str(args))
        out, ret = timeout(args, runTimeout * 2)
        self.log.debug("cleanupContainer returning %d" % ret)

        return out, ret
    
    def safeCleanup(self, vm):
        """safeCleanup - Delete the docker container and make
        sure it is removed.
        """
        start_time = time.time()
        while self.status(vm)[1] == 0:
            if time.time() - start_time > config.DESTROY_SECS:
                self.log.error("Failed to safely destroy container %s" % conf.name)
                return
            self.cleanup(vm)
        return
    
    def status(self, vm):
        """status - Executes `docker inspect CONTAINER`
        """
        return timeout(["docker", "inspect", conf.name])

    def getImages(self):
        """getImages - Executes `docker images` and returns a list of
        images that can be used to boot a docker container with. This
        function is a lot of parsing and so can break easily.
        """
        result = set()
        cmd = "docker images"
        o = subprocess.check_output(cmd, shell=True).decode("utf-8")
        o_l = o.split("\n")
        o_l.pop()
        o_l.reverse()
        o_l.pop()
        for row in o_l:
            row_l = row.split(" ")
            result.add(re.sub(r".*/([^/]*)", r"\1", row_l[0]))
        return list(result)



if __name__ == "__main__":
    conf = DockerConfig(name="test-instance", image="test1", volumn="/Users/tianxie/thesis/testcases/cpp/")
    container = Docker(conf)
    print(container.execute(["make"])[0])
    print(container.execute(["make", "clean"])[0])
    print(container.execute(["make"])[0])
    print(container.stop()[0])
    print(container.cleanup()[0])