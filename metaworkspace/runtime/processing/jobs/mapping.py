from metaworkspace.runtime.processing.jobs import job
from metaworkspace.runtime.workspace import mws
from metacity.core.mapper import build_overlay
from metacity.core.layout import build_layout

class JobMapping(job.Job):
    TYPE = 'mappinglayer'

    def __init__(self):
        super().__init__()
    
    def setup(self, job_dir, project, source, target, overlay):
        super().setup(job_dir)
        self.project: str = project
        self.source: str = source
        self.target: str = target
        self.overlay: str = overlay

    def serialize(self):
        data = super().serialize()    
        data['project'] = self.project    
        data['source'] = self.source
        data['target'] = self.target
        data['overlay'] = self.overlay
        return data
    
    def deserialize(self, data):
        self.project = data['project']
        self.source = data['source']
        self.target = data['target']
        self.overlay = data['overlay']

    def run(self):
        self.update_status('loading resources')
        proj = mws.get_project(self.project)
        overlay = proj.create_overlay(self.overlay)
        source = proj.get_layer(self.source)
        target = proj.get_layer(self.target)
        self.update_status('mapping')
        update = lambda it: self.update_status(it)
        build_overlay(overlay, source, target, update)
        overlay.persist()
        self.update_status('building layout')
        build_layout(proj)
        self.update_status('finished')



