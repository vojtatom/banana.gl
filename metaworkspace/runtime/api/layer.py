import os
from typing import List

from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from metaworkspace.runtime.processing.jobs.loaddataset import JobLoadDataset
from metaworkspace.runtime.workspace import mws

router = APIRouter()

@router.post("/layer/add")
def add_layer(project: str = Form(...), 
                    files: List[UploadFile] = File(...)):

    job = JobLoadDataset()
    layer = os.path.splitext(files[0].filename)[0]
    job_dir = mws.generate_job_dir()
    job.setup(job_dir, project, layer, files)
    job.submit()
    
    return JSONResponse({ 'response': 'OK' })

