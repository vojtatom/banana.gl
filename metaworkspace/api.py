import os

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates


DIR = os.path.realpath(os.path.dirname(__file__))
STATIC = os.path.join(DIR, "client", "static")
TEMPLATES = os.path.join(DIR, "client")


app = FastAPI()
app.mount("/static", StaticFiles(directory=STATIC), name="static")
templates = Jinja2Templates(directory=TEMPLATES)


@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})






def run():
    print("running...")
    uvicorn.run("metaworkspace.api:app", host="127.0.0.1", port=5000, log_level="info", reload=True)


