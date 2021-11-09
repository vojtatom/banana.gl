from metaworkspace.runtime.processing.jobs import job
from metaworkspace.runtime.workspace import mws
from metacity.styles.styles import Style

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
        style = Style(proj, self.style_name)
       
        try:
            style.parse()
        except Exception:
            self.update_status("parsing failed") 
            return

        self.update_status("applying style")
        style.apply()
        self.update_status("finished")
