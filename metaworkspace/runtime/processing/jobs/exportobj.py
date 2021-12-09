from typing import List
from metaworkspace.filesystem import write_json
from metaworkspace.runtime.processing.jobs import job
from metaworkspace.runtime.workspace import mws
from metacity.core.export import export_obj
import metaworkspace.filesystem as fs

class JobExportObj(job.Job):
    TYPE = 'exportOBJ'

    def __init__(self):
        super().__init__()
    
    def setup(self, job_dir, export_dir, project, start, end):
        super().setup(job_dir)
        self.project: str = project
        self.export: str = export_dir
        self.start: List[int, int] = start
        self.end: List[int, int] = end

    def serialize(self):
        data = super().serialize()    
        data['project'] = self.project    
        data['export'] = self.export
        data['start'] = self.start
        data['end'] = self.end
        return data
    
    def deserialize(self, data):
        self.project = data['project']
        self.export = data['export']
        self.start = data['start']
        self.end = data['end']

    def run(self):
        self.update_status('loading resources')
        proj = mws.get_project(self.project)
        fs.create_dir_if_not_exists(self.export)
        self.update_status('exporting')
        export_obj(proj, fs.export_obj_file(self.export), self.start, self.end)
        write_json(fs.export_dir_json(self.export), { "type": "obj", "start": self.start, "end": self.end, "project": self.project })
        self.update_status("finished")
        



