from typing import Dict, Type
from metaworkspace.runtime.processing.jobs.job import Job
from metaworkspace.runtime.processing.jobs.applystyle import JobApplyStyle
from metaworkspace.runtime.processing.jobs.loaddataset import JobLoadDataset
from metaworkspace.runtime.processing.jobs.buildlayout import JobBuildLayout
from metaworkspace.runtime.processing.jobs.mapping import JobMapping
import json
import os
import uuid
from time import sleep


jobs: Dict[str, Type[Job]] = {
    JobLoadDataset.TYPE: JobLoadDataset,
    JobBuildLayout.TYPE: JobBuildLayout,
    JobApplyStyle.TYPE: JobApplyStyle,
    JobMapping.TYPE: JobMapping
}


def job_object_hook(data):
    if 'type' not in data:
        raise Exception(f"Job {data} missing job type")
    
    t = data['type']
    if t not in jobs:
        raise Exception(f"Uknown job type: {t}")

    job = jobs[t]()
    job.deserialize(data)
    return job
    
     
def load_job(job_dir):
    jobfile = os.path.join(job_dir, 'job.json')

    for _ in range(5):
        try:
            with open(jobfile, 'r') as f:
                job: Job = json.load(f, object_hook=job_object_hook)
            job.job_dir = job_dir
            job.setup_log(str(uuid.uuid1()))
            return job
        except Exception as e:
            print(f"Failed to load job: {e}")
            print(f"Retrying in 5 seconds")
            sleep(5)
            return None




