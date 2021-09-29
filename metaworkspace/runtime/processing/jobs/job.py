import json
import os
import shutil
from abc import ABC, abstractmethod



class Job(ABC):
    TYPE = 'base'
    
    def __init__(self):
        super().__init__()
        self.job_dir = None
        self.status = 'created'
    
    #########################################
    # Job Interface:
    def setup(self, job_dir):
        self.job_dir = job_dir

    def serialize(self):
        return {
            'type': self.TYPE, 
            'status': self.status
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
        with open(self.job_file, 'w') as file:
            json.dump(data, file)

    def submit_checks(self):
        if not self.job_dir:
            raise Exception("Cannot submit job without assigned directory")