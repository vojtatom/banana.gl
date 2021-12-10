from metaworkspace.runtime.processing.jobs import job
from metaworkspace.runtime.workspace import mws
from metacity.core.styles.apply import apply_style

class JobApplyStyle(job.Job):
    TYPE = 'applystyle'

    def __init__(self):
        super().__init__()

    def setup(self, job_dir, project, style_name):
        super().setup(job_dir)
        self.project: str = project
        self.style_name: str = style_name

    def serialize(self):
        data = super().serialize()    
        data['project'] = self.project    
        data['style_name'] = self.style_name    
        return data

    def deserialize(self, data):
        self.project = data['project']
        self.style_name = data['style_name']

    def run(self, log):
        self.update_status("getting style", log)
        proj = mws.get_project(self.project)
        self.update_status("parsing style", log)
        apply_style(proj, self.style_name)
        self.update_status("finished", log)
