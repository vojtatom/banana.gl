import os

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from metaworkspace.runtime.api import data, project
from fastapi.middleware.cors import CORSMiddleware

DIR = os.path.realpath(os.path.dirname(__file__))
STATIC = os.path.join(DIR, "../../client", "static")
TEMPLATES = os.path.join(DIR, "../../client")


app = FastAPI()
app.mount("/static", StaticFiles(directory=STATIC), name="static")
app.include_router(project.router)
app.include_router(data.router)
templates = Jinja2Templates(directory=TEMPLATES)

origins = [
    "http://127.0.0.1:5000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})





