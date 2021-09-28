import json
import os


class Job:
    def __inti__(self):
        pass

    def serialize(self, job_dir):
        raise NotImplementedError()
    
    def deserialize(self, data):
        raise NotImplementedError()

    def run(self):
        raise NotImplementedError()

    def to_jobfile(self, job, job_dir):
        job_path = os.path.join(job_dir, "job.json")
        with open(job_path, 'w') as job_file:
            json.dump(job, job_file)
        job_flag = os.path.join(job_dir, "job.ready")
        with open(job_flag, 'w') as job_file:
            pass
