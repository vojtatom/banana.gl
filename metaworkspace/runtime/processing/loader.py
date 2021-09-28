from typing import Dict, Type
from metaworkspace.runtime.processing.jobs.job import Job
from metaworkspace.runtime.processing.jobs.loaddataset import JobLoadDataset


jobs: Dict[str, Type[Job]] = {
    'JobLoadDataset': JobLoadDataset
}


def job_object_hook(data):
    if 'job' not in data:
        raise Exception(f"Job {data} missing job type")
    
    if data['job'] not in jobs:
        raise Exception(f"Uknown job type: {data['job']}")

    job = jobs[data['job']]()
    job.deserialize(data)
    return job
    
     




