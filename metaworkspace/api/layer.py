import os
import shutil
from typing import List

from fastapi import APIRouter, File, Form, UploadFile
from fastapi.responses import JSONResponse
from metacity.io.load import load
from metacity.grid.build import build_grid
from metaworkspace.api.workspace import mws

router = APIRouter()

@router.post("/layer/add")
def add_layer(project: str = Form(...), 
                    files: List[UploadFile] = File(...)):
    print(project)

    layer_name = os.path.splitext(files[0].filename)[0]
    prj = mws.project(project)
    layer = prj.create_layer(layer_name)

    lfiles = []
    for ufile in files:
        local_file_path = layer.source_file_path(ufile.filename)
        with open(local_file_path, "wb+") as local_file:
            shutil.copyfileobj(ufile.file, local_file)
        lfiles.append(local_file_path)

    log = []
    for file in lfiles:
        print(lfiles)
        try:
            load(layer, file)
        except Exception as e:
            log.append(str(e))  

    build_grid(layer, 1000)

    return JSONResponse({ 'log': log })

