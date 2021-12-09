from typing import List
from metaworkspace.filesystem import write_json
from metaworkspace.runtime.processing.jobs import job
from metaworkspace.runtime.workspace import mws
from metacity.core.legofy import legofy
import metaworkspace.filesystem as fs

class JobExportLego(job.Job):
    TYPE = 'exportLEGO'

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
        cdp=2
        bfsr=(15, 45)
        bfs=5
        legofy(proj, self.export, self.start, self.end, coordinates_decimal_precision=cdp, box_filter_size_range=bfsr, box_filter_step=bfs)
        write_json(fs.export_dir_json(self.export), { "type": "lego", "start": self.start, "end": self.end, "unit_precision": cdp, "box_filter_size_range": bfsr, "box_filter_step": bfs, "project": self.project })
        self.update_status("finished")
        



