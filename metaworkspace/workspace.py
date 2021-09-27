import os
from metaworkspace import install, run
from metaworkspace import filesystem as fs
from metacity.datamodel.project import MetacityProject


class MetacityWorkspace:
    def __init__(self, workspace_path: str):
        self.path = os.path.abspath(workspace_path)

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

    def reinstall(self):
        install.reinstall(self.path)

    def run(self):
        run.run(self.path)


