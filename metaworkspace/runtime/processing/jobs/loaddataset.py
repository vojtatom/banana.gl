import os
import shutil

from metacity.grid.build import build_grid
from metacity.io.load import load
from metaworkspace.runtime.processing.jobs import job
from metaworkspace.runtime.workspace import mws


class JobLoadDataset(job.Job):
    TYPE = 'loaddataset'

    def __init__(self):
        super().__init__()
    
    def setup(self, job_dir, project, layer, files):
        super().setup(job_dir)
        lfiles = self.setup_resources(job_dir, files)
        self.project = project
        self.layer = layer
        self.files = lfiles

    def serialize(self):
        data = super().serialize()    
        data['project'] = self.project    
        data['layer'] = self.layer    
        data['files'] = self.files    
        return data
    
    def deserialize(self, data):
        self.project = data['project']
        self.layer = data['layer']
        self.files = data['files']

    def run(self):
        layer = self.parse_files() 
        self.update_status("building grid")
        build_grid(layer, 1000)
        self.update_status("finished")

    def setup_resources(self, job_dir, files):
        lfiles = []
        for ufile in files:
            local_file_path = os.path.join(job_dir, ufile.filename)
            with open(local_file_path, "wb+") as local_file:
                shutil.copyfileobj(ufile.file, local_file)
            lfiles.append(local_file_path)
        return lfiles

    def parse_files(self):
        proj = mws.project(self.project)
        layer = proj.create_layer(self.layer)
        for i, file in enumerate(self.files):
            self.update_status(f"parsing files: {i}/{len(self.files)}")
            try:
                layer.add_source_file(file)
                load(layer, file)
            except Exception as e:
                print(e)
        return layer
        


