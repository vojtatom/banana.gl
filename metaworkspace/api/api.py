import os

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from metaworkspace.api import project


DIR = os.path.realpath(os.path.dirname(__file__))
STATIC = os.path.join(DIR, "../client", "static")
TEMPLATES = os.path.join(DIR, "../client")


app = FastAPI()
app.mount("/static", StaticFiles(directory=STATIC), name="static")
app.include_router(project.router)
templates = Jinja2Templates(directory=TEMPLATES)


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})





