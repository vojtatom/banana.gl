import os
from metaworkspace import filesystem as fs
from metacity.datamodel.project import Project


class MetacityWorkspace:
    def __init__(self, workspace_path: str):
        self.path = os.path.abspath(workspace_path)

    @property
    def projects_dir(self):
        return fs.projects_dir(self.path)

    @property
    def jobs_dir(self):
        return fs.jobs_dir(self.path)

    @property
    def logs_dir(self):
        return fs.logs_dir(self.path)

    @property
    def project_names(self):
        return fs.get_projects(self.path)

    @property
    def projects(self):
        for prj_dir in fs.get_projects(self.path):
            yield Project(prj_dir)

    def project(self, name: str):
        prj = fs.project_dir(self.path, name)
        fs.create_dir_if_not_exists(prj)
        return Project(prj)

    @property
    def server_log(self):
        return fs.server_log(self.path) 

    @property
    def jobs_log(self):
        return fs.jobs_log(self.path) 

    def generate_job_dir(self):
        return fs.generate_job_dir(self.path)

    def clear_logs(self):
        fs.archive_logs(self.path)
