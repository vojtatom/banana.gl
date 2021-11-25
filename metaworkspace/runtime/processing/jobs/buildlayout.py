from metaworkspace.runtime.processing.jobs import job
from metaworkspace.runtime.workspace import mws
from metacity.core.layout import build_layout


class JobBuildLayout(job.Job):
    TYPE = 'buildlayout'

    def __init__(self):
        super().__init__()
    
    def setup(self, job_dir, project):
        super().setup(job_dir)
        self.project: str = project

    def serialize(self):
        data = super().serialize()    
        data['project'] = self.project    
        return data
    
    def deserialize(self, data):
        self.project = data['project']

    def run(self):
        proj = mws.get_project(self.project)
        self.update_status("building layout")
        build_layout(proj)
        self.update_status("finished")



