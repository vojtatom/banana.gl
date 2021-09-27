import os
import shutil


def create_dir_if_not_exists(dir):
    if not os.path.exists(dir):
        os.makedirs(dir)


def recreate_dir(dir):
    if os.path.exists(dir):
        shutil.rmtree(dir)
    create_dir_if_not_exists(dir)


def projects_dir(workspace_path):
    return os.path.join(workspace_path, "projects")


def jobs_dir(workspace_path):
    return os.path.join(workspace_path, "jobs")


def project_dir(workspace_path, project_name):
    return os.path.join(projects_dir(workspace_path), project_name)


def get_projects(workspace_path):
    projects = projects_dir(workspace_path)
    for project in os.listdir(projects):
        yield project


def config(workspace_path):
    return os.path.join(workspace_path, "config.json")


def recreate_workspace(workspace_path):
    recreate_dir(workspace_path)
    create_dir_if_not_exists(projects_dir(workspace_path))
    create_dir_if_not_exists(jobs_dir(workspace_path))


