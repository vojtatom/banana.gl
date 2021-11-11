import os
from typing import List
from time import sleep
from fastapi import APIRouter, File, Form, UploadFile, Depends, HTTPException, status, Response
from fastapi.responses import JSONResponse
from metacity.styles.styles import parse
from metaworkspace.runtime.processing.jobs.loaddataset import JobLoadDataset
from metaworkspace.runtime.processing.jobs.buildlayout import JobBuildLayout
from metaworkspace.runtime.processing.jobs.applystyle import JobApplyStyle
from metaworkspace.runtime.processing.jobs.mapping import JobMapping
from metaworkspace.runtime.workspace import mws
from pydantic import BaseModel
from metaworkspace.runtime.api.auth import User, get_current_active_user


router = APIRouter(prefix="/api",
                   tags=["api"])


class ProjectData(BaseModel):
    name: str


class RenameProjectData(BaseModel):
    old: str
    new: str


class LayerData(BaseModel):
    project: str
    name: str


class RenameLayerData(BaseModel):
    project: str
    old: str
    new: str


class MappingLayerData(BaseModel):
    project: str
    source: str
    target: str
    overlay: str

class LogData(BaseModel):
    name: str


class StyleData(BaseModel):
    project: str
    name: str
    styles: str


class ActionStyleData(BaseModel):
    project: str
    name: str


class RenameStyleData(BaseModel):
    project: str
    old: str
    new: str


class MetaData(BaseModel):
    project: str
    layer: str
    oid: int


#### PROJECT

@router.get("/projects", response_class=JSONResponse)
def list_projects():
    projects = []
    for project in mws.project_names:
        projects.append(project)
    return JSONResponse(projects)


@router.post("/project")
def add_project(project: ProjectData, current_user: User = Depends(get_current_active_user)):
    for p in mws.project_names:
        if p == project.name:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Project {project.name} already exists"
            )

    mws.create_project(project.name)
    return Response(status_code=status.HTTP_201_CREATED) 


@router.post("/project/rename")
def rename_project(project: RenameProjectData, current_user: User = Depends(get_current_active_user)):
    if mws.rename_project(project.old, project.new):
        return Response(status_code=status.HTTP_200_OK) 
    else:
        raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Project {project.new} already exists"
            )


@router.delete("/project")
def delete_project(project: ProjectData, current_user: User = Depends(get_current_active_user)):
    mws.delete_project(project.name)
    return Response(status_code=status.HTTP_200_OK)


@router.post("/project/meta")
def get_metadata(meta: MetaData, current_user: User = Depends(get_current_active_user)):
    prj = mws.get_project(meta.project)
    if prj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project {meta.project} not found"
        )

    layer = prj.get_layer(meta.layer, load_model=False)

    try:
        object = layer[meta.oid]
        return JSONResponse(object.meta)
    except:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Object {meta.oid} not found"
        )

#### LAYER

@router.post("/layers", response_class=JSONResponse)
def list_layers(project: ProjectData, current_user: User = Depends(get_current_active_user)):
    prj = mws.get_project(project.name)
    if prj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    print(prj)
    data = []
    #TODO HERE
    for l in prj.clayers(load_set=False):
        data.append({ 'name': l.name, 'size': l.size, 'type' : l.type, 'disabled': l.disabled })
    return JSONResponse(data) 


@router.post("/layer")
def add_layer(project: str = Form(...), 
              layer: str = Form(...), 
              files: List[UploadFile] = File(...),
              current_user: User = Depends(get_current_active_user)):
    job = JobLoadDataset()
    if layer is None:
        layer = os.path.splitext(files[0].filename)[0]
    job_dir = mws.generate_job_dir()
    job.setup(job_dir, project, layer, files)
    job.submit()

    return Response(status_code=status.HTTP_201_CREATED)


@router.post("/layer/rename")
def rename_layer(layer: RenameLayerData, current_user: User = Depends(get_current_active_user)):
    prj = mws.get_project(layer.project)
    if prj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if prj.rename_layer(layer.old, layer.new):
        return Response(status_code=status.HTTP_200_OK) 
    else:
        raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Layer {layer.new} already exists"
            )


@router.post("/layer/disable")
def disable_layer(layer: LayerData, current_user: User = Depends(get_current_active_user)):
    prj = mws.get_project(layer.project)
    if prj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    try:
        lyr = prj.get_layer(layer.name, load_set=False)
    except:
        lyr = prj.get_overlay(layer.name)
        
    lyr.disabled = True
    lyr.export()
    return Response(status_code=status.HTTP_200_OK)


@router.post("/layer/enable")
def enable_layer(layer: LayerData, current_user: User = Depends(get_current_active_user)):
    prj = mws.get_project(layer.project)
    if prj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    try:
        lyr = prj.get_layer(layer.name, load_set=False)
    except:
        lyr = prj.get_overlay(layer.name)
        
    lyr.disabled = False
    lyr.export()
    return Response(status_code=status.HTTP_200_OK)


@router.delete("/layer")
def delete_layer(layer: LayerData, current_user: User = Depends(get_current_active_user)):
    prj = mws.get_project(layer.project)
    if prj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    prj.delete_layer(layer.name)
    return Response(status_code=status.HTTP_200_OK)


##### LOGS

@router.get("/jobs", response_class=JSONResponse)
def list_jobs(current_user: User = Depends(get_current_active_user)):
    data = mws.get_current_job_configs()
    return JSONResponse(data) 


@router.get("/logs", response_class=JSONResponse)
def list_logs(current_user: User = Depends(get_current_active_user)):
    data = mws.get_logs()
    return JSONResponse(data) 


@router.post("/log", response_class=JSONResponse)
def get_log(log: LogData, current_user: User = Depends(get_current_active_user)):
    data = mws.get_log(log.name)
    if data == None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Log not found"
        )

    return JSONResponse(data) 

##### ACTIONS

@router.post("/project/build")
def build_project(project: ProjectData, current_user: User = Depends(get_current_active_user)):

    job = JobBuildLayout()
    job_dir = mws.generate_job_dir()
    job.setup(job_dir, project.name)
    job.submit()
    
    return Response(status_code=status.HTTP_200_OK)

@router.post("/layer/map")
def map_layer(layer: MappingLayerData, current_user: User = Depends(get_current_active_user)):

    job = JobMapping()
    job_dir = mws.generate_job_dir()
    job.setup(job_dir, layer.project, layer.source, layer.target, layer.overlay)
    job.submit()
    
    return Response(status_code=status.HTTP_200_OK)


@router.post("/style/apply")
def apply_style(style: ActionStyleData, current_user: User = Depends(get_current_active_user)):
    job = JobApplyStyle()
    job_dir = mws.generate_job_dir()
    job.setup(job_dir, style.project, style.name)
    job.submit()
    return Response(status_code=status.HTTP_200_OK)


@router.post("/style/parse")
def parse_style(style: StyleData, current_user: User = Depends(get_current_active_user)):
    try:
        parse(style.styles)
    except Exception as e:
            return JSONResponse({
                'status': 'error',
                'error': str(e)
            }) 
    return Response(status_code=status.HTTP_200_OK)




#### STYLES
@router.post("/styles", response_class=JSONResponse)
def get_styles(project: ProjectData, current_user: User = Depends(get_current_active_user)):
    prj = mws.get_project(project.name)
    if prj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    styles = prj.styles.list_styles()
    return JSONResponse(styles) 


@router.post("/style/create")
def create_style(style: ActionStyleData, current_user: User = Depends(get_current_active_user)):
    prj = mws.get_project(style.project)
    if prj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    if prj.styles.create_style(style.name):
        return Response(status_code=status.HTTP_200_OK)
    else:
        raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Style {style.name} already exists"
            )


@router.post("/style")
def get_style(style: ActionStyleData, current_user: User = Depends(get_current_active_user)):
    proj = mws.get_project(style.project)
    if proj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    style_data = proj.styles.get_style(style.name)
    return JSONResponse({'style': style_data, 'name': style.name }) 


@router.post("/style/update", response_class=JSONResponse)
def update_style(style: StyleData, current_user: User = Depends(get_current_active_user)):
    proj = mws.get_project(style.project)
    if proj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    proj.styles.update_style(style.name, style.styles)
    return Response(status_code=status.HTTP_200_OK)


@router.delete("/style")
def delete_style(style: ActionStyleData, current_user: User = Depends(get_current_active_user)):
    proj = mws.get_project(style.project)
    if proj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    proj.styles.delete_style(style.name)
    return Response(status_code=status.HTTP_200_OK)


@router.post("/style/rename")
def rename_style(style: RenameStyleData, current_user: User = Depends(get_current_active_user)):
    proj = mws.get_project(style.project)
    if proj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    if proj.styles.rename_style(style.old, style.new):
        return Response(status_code=status.HTTP_200_OK)
    raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Style {style.name} already exists"
        )