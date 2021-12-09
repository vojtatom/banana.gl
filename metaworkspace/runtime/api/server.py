import os

from fastapi import FastAPI, Depends, Request

from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from metaworkspace.runtime.api import api
from metaworkspace.runtime.api import auth
from metaworkspace.runtime.workspace import mws
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware


DIR = os.path.realpath(os.path.dirname(__file__))
STATIC = os.path.join(DIR, "../../client", "static")
ASSETS = os.path.join(DIR, "../../client", "assets")
PROJECTS = mws.projects_dir
EXPORTS = mws.exports_dir
TEMPLATES = os.path.join(DIR, "../../client")


def create_app():
    """Create app wrapper to overcome middleware issues."""
    templates = Jinja2Templates(directory=TEMPLATES)

    app = FastAPI(debug=False)
    #app.include_router(project.router)
    #app.include_router(auth.router)
    app.mount("/static", StaticFiles(directory=STATIC), name="static")
    app.mount("/assets", StaticFiles(directory=ASSETS), name="assets")
    app.mount("/api/data", StaticFiles(directory=PROJECTS), name="data")
    app.mount("/api/exports", StaticFiles(directory=EXPORTS), name="exports")

    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:5000",
        "http://localhost:5000",
        "*",
    ]

    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    return app, app, templates

    #return CORSMiddleware(
    #    app=app,
    #    allow_origins=origins,
    #    allow_credentials=True,
    #    allow_methods=["*"],
    #    allow_headers=["*"],
    #), app, templates


app, fastapi, templates = create_app()


fastapi.include_router(api.router)
fastapi.include_router(auth.router)
@fastapi.get("/{path:path}", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})



