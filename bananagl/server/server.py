import os

from bananagl.server.api import router as api_router
from bananagl.server.config import path
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware

DIR = os.path.realpath(os.path.dirname(__file__))
STATIC = os.path.join(DIR, "../../client", "static")
ASSETS = os.path.join(DIR, "../../client", "assets")
TEMPLATES = os.path.join(DIR, "../../client")
DATA = path

def create_app():
    """Create app wrapper to overcome middleware issues."""
    templates = Jinja2Templates(directory=TEMPLATES)

    if "BANANAENV" in os.environ and os.environ["BANANAENV"] == "LOCAL":
        app = FastAPI(debug=True)
    else:
        app = FastAPI(debug=False)
    
    app.mount("/static", StaticFiles(directory=STATIC), name="static")
    app.mount("/assets", StaticFiles(directory=ASSETS), name="assets")

    if "BANANAENV" in os.environ and os.environ["BANANAENV"] == "LOCAL":
        app.mount("/api/data", StaticFiles(directory=DATA), name="data")

    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:5000",
        "http://localhost:5000",
        "*",
    ]

    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    return app, templates

app, templates = create_app()
app.include_router(api_router)

@app.get("/{path:path}", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})



