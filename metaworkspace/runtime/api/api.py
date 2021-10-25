import os

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from metaworkspace.runtime.api import project
from starlette.middleware.cors import CORSMiddleware
from metaworkspace.runtime.workspace import mws

DIR = os.path.realpath(os.path.dirname(__file__))
STATIC = os.path.join(DIR, "../../client", "static")
PROJECTS = mws.projects_dir
TEMPLATES = os.path.join(DIR, "../../client")


def create_app() -> CORSMiddleware:
    """Create app wrapper to overcome middleware issues."""
    templates = Jinja2Templates(directory=TEMPLATES)

    app = FastAPI()
    app.mount("/static", StaticFiles(directory=STATIC), name="static")
    app.mount("/data", StaticFiles(directory=PROJECTS), name="data")
    app.include_router(project.router)
    #app.include_router(data.router)

    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:5000"
    ]

    return CORSMiddleware(
        app=app,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    ), app, templates


app, fastapi, templates = create_app()

@fastapi.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})





