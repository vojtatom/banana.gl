import os
import shutil
import uuid
from datetime import datetime


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


def logs_dir(workspace_path):
    return os.path.join(workspace_path, "logs")


def server_log(workspace_path):
    return os.path.join(logs_dir(workspace_path), "server_log.txt")


def jobs_log(workspace_path):
    return os.path.join(logs_dir(workspace_path), "jobs_log.txt")


def project_dir(workspace_path, project_name):
    return os.path.join(projects_dir(workspace_path), project_name)


def get_projects(workspace_path):
    projects = projects_dir(workspace_path)
    for project in os.listdir(projects):
        if project[0] != '.':
            yield project


def config(workspace_path):
    return os.path.join(workspace_path, "config.json")


def current_jobs(workspace_path):
    jobs = jobs_dir(workspace_path)
    return [job for job in os.listdir(jobs)]


def generate_job_dir(workspace_path):
    jobs = jobs_dir(workspace_path)
    names = current_jobs(workspace_path)
    jid = str(uuid.uuid4())
    while jid in names:
        jid = str(uuid.uuid4())
    job_dir = os.path.join(jobs, jid)
    create_dir_if_not_exists(job_dir)
    return job_dir


def recreate_workspace(workspace_path):
    recreate_dir(workspace_path)
    create_dir_if_not_exists(projects_dir(workspace_path))
    create_dir_if_not_exists(jobs_dir(workspace_path))
    create_dir_if_not_exists(logs_dir(workspace_path))

def archive_logs(workspace_path):
    logs = logs_dir(workspace_path)
    if os.path.exists(logs):
        new_logs_name = datetime.now().strftime('%Y-%m-%d-%H:%M:%S')
        new_logs_path = os.path.join(workspace_path, f'logs-{new_logs_name}')
        os.rename(logs, new_logs_path)
    create_dir_if_not_exists(logs)
