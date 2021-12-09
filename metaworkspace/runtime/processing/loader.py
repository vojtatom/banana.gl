from typing import Dict, Type
from metaworkspace.runtime.processing.jobs.job import Job
from metaworkspace.runtime.processing.jobs.applystyle import JobApplyStyle
from metaworkspace.runtime.processing.jobs.loaddataset import JobLoadDataset
from metaworkspace.runtime.processing.jobs.buildlayout import JobBuildLayout
from metaworkspace.runtime.processing.jobs.mapping import JobMapping
from metaworkspace.runtime.processing.jobs.exportobj import JobExportObj
from metaworkspace.runtime.processing.jobs.exportlego import JobExportLego
import json
import os
import uuid
from time import sleep


jobs: Dict[str, Type[Job]] = {
    JobLoadDataset.TYPE: JobLoadDataset,
    JobBuildLayout.TYPE: JobBuildLayout,
    JobApplyStyle.TYPE: JobApplyStyle,
    JobMapping.TYPE: JobMapping,
    JobExportObj.TYPE: JobExportObj,
    JobExportLego.TYPE: JobExportLego
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
    
     
def load_job(job_dir, log):
    jobfile = os.path.join(job_dir, 'job.json')

    i = 0
    for _ in range(5):
        try:
            with open(jobfile, 'r') as f:
                job: Job = json.load(f, object_hook=job_object_hook)
            job.job_dir = job_dir
            job.setup_log(str(uuid.uuid1()))
            return job
        except Exception as e:
            if i == 5:
                return None

            log.error(f"Failed to load job: {e}")
            log.info(f"Retrying in 5 seconds")
            sleep(5)





