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
            'project': project.name,
            'name': layer.name,
            'shift': layer.config.shift,
            'grid': layer.grid.config.serialize()
        })

    return JSONResponse(data) 



class TileData(BaseModel):
    project: str
    layer: str
    x: str
    y: str


@router.post("/tile")
async def project_layout(tile_idf: TileData):
    prj = mws.project(tile_idf.project)
    layer = prj.get_layer(tile_idf.layer)
    tile = layer.grid.tile(tile_idf.x, tile_idf.y)

    models = []
    for model in tile.models:
        models.append(model.serialize())

    return JSONResponse(models) 