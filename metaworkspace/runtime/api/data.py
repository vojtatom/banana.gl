from fastapi import APIRouter
from fastapi.responses import JSONResponse
from metaworkspace.runtime.workspace import mws
from pydantic import BaseModel

router = APIRouter()

class ProjectData(BaseModel):
    name: str

    

@router.post("/layout")
async def project_layout(project: ProjectData):
    prj = mws.project(project.name)
    
    data = []
    for layer in prj.layers:
        data.append({
            'name': layer.name,
            'shift': layer.config.shift,
            'grid': layer.grid.config.serialize()
        })

    return JSONResponse(data) 
