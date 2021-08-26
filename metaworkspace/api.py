import os

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from metaworkspace.workspace import MetacityWorkspace

DIR = os.path.realpath(os.path.dirname(__file__))
STATIC = os.path.join(DIR, "client", "static")
TEMPLATES = os.path.join(DIR, "client")

if "METACITYWS" in os.environ:
    MWSPATH = os.environ["METACITYWS"]
else:
    raise Exception("Trying to import or execute api.py without environment propery set.")


app = FastAPI()
metaws = MetacityWorkspace(MWSPATH)

app.mount("/static", StaticFiles(directory=STATIC), name="static")
templates = Jinja2Templates(directory=TEMPLATES)


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/projects", response_class=JSONResponse)
async def projects(request: Request):
    return JSONResponse({"path": metaws.path})


