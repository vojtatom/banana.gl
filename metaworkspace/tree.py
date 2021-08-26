import os
import shutil


def create_dir_if_not_exists(dir):
    if not os.path.exists(dir):
        os.makedirs(dir)


def recreate_dir(dir):
    if os.path.exists(dir):
        shutil.rmtree(dir)
    create_dir_if_not_exists(dir)


def tools_dir(workspace_path):
    return os.path.join(workspace_path, "tools")


def projects_dir(workspace_path):
    return os.path.join(workspace_path, "projects")


def get_projects(workspace_path):
    projects = projects_dir(workspace_path)
    for project in os.listdir(projects):
        yield project


def config(workspace_path):
    return os.path.join(workspace_path, "config.json")


def tools_dir_module(workspace_path, module):
    tools_module_dir = os.path.join(workspace_path, "tools", module)
    create_dir_if_not_exists(tools_module_dir)
    return tools_module_dir


def recreate_workspace(workspace_path):
    recreate_dir(workspace_path)
    create_dir_if_not_exists(tools_dir(workspace_path))
    create_dir_if_not_exists(projects_dir(workspace_path))


