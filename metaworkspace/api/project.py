from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from metaworkspace.api.workspace import mws
from pydantic import BaseModel

router = APIRouter()


@router.get("/projects", response_class=JSONResponse)
async def list_projects(request: Request):
    projects = []
    for project in mws.projects:
        projects.append(project)
    return JSONResponse(projects)


class ProjectData(BaseModel):
    name: str


@router.post("/project")
async def create_project(project: ProjectData):
    return project
