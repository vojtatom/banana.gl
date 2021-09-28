import os
import shutil
from typing import List

from metacity.grid.build import build_grid
from metacity.io.load import load
from metaworkspace.runtime.processing.jobs import job
from metaworkspace.runtime.workspace import mws


def action(project: str, layer: str, files: List[str]):
    proj = mws.project(project)
    layer = proj.create_layer(layer)
    for file in files:
        try:
            load(layer, file)
        except Exception as e:
            print(e) 
    build_grid(layer, 1000)


class JobLoadDataset(job.Job):
    def __init__(self):
        super().__init__()

    def add_data(self, project, layer, files):
        self.project = project
        self.layer = layer
        self.files = files

    def serialize(self, job_dir: str):
        lfiles = []
        for ufile in self.files:
            local_file_path = os.path.join(job_dir, ufile.filename)
            with open(local_file_path, "wb+") as local_file:
                shutil.copyfileobj(ufile.file, local_file)
            lfiles.append(local_file_path)
        
        self.to_jobfile({
                'job': 'JobLoadDataset',
                'project': self.project,
                'layer': self.layer,
                'files': lfiles
            }, job_dir)
    
    def deserialize(self, data):
        self.project = data['project']
        self.layer = data['layer']
        self.files = data['files']

    def run(self):
        action(self.project, self.layer, self.files)
