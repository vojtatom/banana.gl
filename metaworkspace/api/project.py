from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from metaworkspace.api.workspace import mws
from metaworkspace import filesystem as fs
from metacity.datamodel.project import MetacityProject
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
    pd = fs.project_dir(mws.projects_dir, project.name)
    project = MetacityProject(pd, load_existing=False)
    return JSONResponse({ 'dir': pd }) 

