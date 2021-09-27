from fastapi import APIRouter, Form, File, UploadFile
from fastapi.responses import JSONResponse
from metaworkspace.api.workspace import mws
from metaworkspace import filesystem as fs
from metacity.datamodel.project import MetacityProject
from pydantic import BaseModel
from typing import List
import os 


router = APIRouter()

@router.post("/layer/add")
async def add_layer(project: str = Form(...), 
                    files: List[UploadFile] = File(...)):
    print(project)
    print(files)

    layer_name = os.path.splitext(files[0].filename)[0]
    prj = mws.project(project)
    layer = prj.create_layer(layer_name)
    for file in files:
            


    return JSONResponse({ 'project': project })

