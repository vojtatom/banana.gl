import json
import os
from metaworkspace import init, install, run, tree


class MetacityWorkspace:
    def __init__(self, workspace_path: str):
        self.path = os.path.abspath(workspace_path)


    @property
    def config_file(self):
        return tree.config(self.path)

    
    @property
    def projects_dir(self):
        return tree.projects_dir(self.path)


    def update_config(self, key, value):
        try:
            with open(self.config_file, "r") as config:
                data = json.load(config)
        except:
            data = {}
        
        data[key] = value
        with open(self.config_file, "w") as config:
            json.dump(data, config, indent=4)


    @property
    def config(self):
        with open(self.config_file, "r") as file:
            return json.load(file)


    def init(self):
        config = self.config
        init.setup_java(config)


    def reinstall(self):
        config = install.reinstall(self.path)
        for k, v in config.items():
            self.update_config(k, v)


    def run(self):
        run.run(self.path)

    @property
    def projects(self):
        return tree.get_projects(self.path)

