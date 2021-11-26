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

    def run(self):
        self.update_status("getting style")
        proj = mws.get_project(self.project)
        self.update_status("parsing style")
       
        try:
            apply_style(proj, self.style_name)
        except Exception as e:
            self.update_status(e)
            self.update_status("parsing failed") 
            return

        self.update_status("finished")
