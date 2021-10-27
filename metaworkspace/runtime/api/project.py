import os
from typing import List

from fastapi import APIRouter, File, Form, Request, UploadFile
from fastapi.responses import JSONResponse
from metaworkspace.runtime.processing.jobs.loaddataset import JobLoadDataset
from metaworkspace.runtime.workspace import mws
from pydantic import BaseModel

router = APIRouter()

@router.get("/projects", response_class=JSONResponse)
async def list_projects(request: Request):
    projects = []
    for project in mws.project_names:
        projects.append({'name' : project})
    return JSONResponse(projects)


class ProjectData(BaseModel):
    name: str

@router.post("/project/exists")
async def project_exists(project: ProjectData):
    for p in mws.project_names:
        if p == project.name:
            return JSONResponse({ 'exists': True })
    return JSONResponse({ 'exists': False })


@router.post("/project/add")
async def add_project(project: ProjectData):
    mws.project(project.name)
    return JSONResponse({ 'dir': project.name }) 


@router.post("/project/layer/add")
def add_layer(project: str = Form(...), 
                    files: List[UploadFile] = File(...)):

    job = JobLoadDataset()
    layer = os.path.splitext(files[0].filename)[0]
    job_dir = mws.generate_job_dir()
    job.setup(job_dir, project, layer, files)
    job.submit()
    
    return JSONResponse({ 'response': 'OK' })


@router.post("/project/layer/list")
async def list_layers(project: ProjectData):
    prj = mws.project(project.name)
    
    data = []
    try:
        for l in prj.layer_names:
            data.append({
                'name': l
            })
    except:
        pass

    return JSONResponse(data) 

