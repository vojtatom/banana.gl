import json
import logging
import os
import shutil
from metaworkspace.runtime.logging import setup_logging
from abc import ABC, abstractmethod
import metaworkspace.filesystem as fs


class Job(ABC):
    TYPE = 'base'
    
    def __init__(self):
        super().__init__()
        self.job_dir = None
        self.job_id = None
        self.log_id = None
        self.status = 'created'
    
    #########################################
    # Job Interface:
    def setup(self, job_dir):
        self.job_dir = job_dir
        self.job_id = fs.id_from_jobdir(self.job_dir)

    def serialize(self):
        return {
            'type': self.TYPE, 
            'status': self.status,
            'job_id': self.job_id,
            'log_id': self.log_id
            }

    @abstractmethod
    def deserialize(self):
        pass

    @abstractmethod
    def run(self):
        pass

    #########################################
    @property
    def job_file(self):
        return os.path.join(self.job_dir, "job.json")
    
    @property
    def job_flag(self):
        return os.path.join(self.job_dir, "job.ready")

    def cleanup(self):
        log = logging.getLogger(self.log_id)
        log.info(f"Job {os.path.basename(self.job_dir)}: {self.serialize()}")
        shutil.rmtree(self.job_dir)

    def submit(self):
        self.submit_checks()
        data = self.serialize()
        with open(self.job_file, 'w') as file:
            json.dump(data, file)
        with open(self.job_flag, 'w') as file:
            pass

    def update_status(self, status):
        self.status = status
        data = self.serialize()
        self.log(self.status)
        with open(self.job_file, 'w') as file:
            json.dump(data, file)

    def log(self, message):
        log = logging.getLogger(self.log_id)
        log.info(f"Job {os.path.basename(self.job_dir)}: {message}")

    def submit_checks(self):
        if not self.job_dir:
            raise Exception("Cannot submit job without assigned directory")

    def setup_log(self, logid):
        self.log_id = logid
        setup_logging(logid)