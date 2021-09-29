from metaworkspace.runtime.processing.jobs.job import Job
import os
from metaworkspace import filesystem as fs
from metacity.datamodel.project import MetacityProject


class MetacityWorkspace:
    def __init__(self, workspace_path: str):
        self.path = os.path.abspath(workspace_path)

    @property
    def jobs_dir(self):
        return fs.jobs_dir(self.path)

    @property
    def project_names(self):
        return fs.get_projects(self.path)

    @property
    def projects(self):
        for prj_dir in fs.get_projects(self.path):
            yield MetacityProject(prj_dir)

    def project(self, name: str):
        prj = fs.project_dir(self.path, name)
        fs.create_dir_if_not_exists(prj)
        return MetacityProject(prj)

    def clear_logs(self):
        log_path = fs.server_log(self.path)
        open(log_path, 'w').close()

    @property
    def server_log(self):
        return fs.server_log(self.path) 

    @property
    def jobs_log(self):
        return fs.jobs_log(self.path) 

    def generate_job_dir(self):
        return fs.generate_job_dir(self.path)
