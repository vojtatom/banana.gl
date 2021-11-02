from metaworkspace.runtime.processing.jobs import job
from metaworkspace.runtime.workspace import mws


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
        proj.build_layout()
        self.update_status("finished")



