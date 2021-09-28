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
    job.add_data(project, layer, files)
    mws.add_job(job)

    return JSONResponse({ 'response': 'OK' })

