import os
import shutil
import uuid
import json
from datetime import datetime


def write_json(filename, data):
    if os.path.exists(filename):
        os.remove(filename)

    with open(filename, 'w') as file:
        json.dump(data, file, indent=4)


def read_json(filename):
    with open(filename, 'r') as file:
        return json.load(file)


def file_exists(file):
    return os.path.exists(file)


def remove_dirtree(dir):
    if os.path.exists(dir):
        shutil.rmtree(dir)


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


def user_dir(workspace_path):
    return os.path.join(workspace_path, "users")


def user_file(user_dir, username):
    return os.path.join(user_dir, f"{username}.json")


def security_config(workspace_path):
    return os.path.join(workspace_path, f"security.json")


def server_log(workspace_path):
    return os.path.join(logs_dir(workspace_path), "server_log.txt")


def jobs_log(workspace_path):
    return os.path.join(logs_dir(workspace_path), "jobs_log.txt")


def log_contents(workspace_path, log_name: str):
    if log_name.endswith(".log") or log_name.endswith(".txt"):
        path = os.path.join(logs_dir(workspace_path), log_name)
    else:
        path = os.path.join(logs_dir(workspace_path), log_name + ".log")
    
    if file_exists(path):
        with open(path, 'r') as file:
            return file.read()
    return None


def project_dir(workspace_path, project_name):
    return os.path.join(projects_dir(workspace_path), project_name)


def get_projects(workspace_path):
    projects = projects_dir(workspace_path)
    for project in os.listdir(projects):
        if project[0] != '.':
            yield project

def current_jobs(workspace_path):
    jobs = jobs_dir(workspace_path)
    return [job for job in os.listdir(jobs)]

def current_logs(workspace_path):
    logs = logs_dir(workspace_path)
    return [logs for logs in os.listdir(logs)]

def generate_job_dir(workspace_path):
    jobs = jobs_dir(workspace_path)
    names = current_jobs(workspace_path)
    jid = str(uuid.uuid4())
    while jid in names:
        jid = str(uuid.uuid4())
    job_dir = os.path.join(jobs, jid)
    create_dir_if_not_exists(job_dir)
    return job_dir


def id_from_jobdir(jobdir):
    return os.path.basename(jobdir)


def current_job_configs(workspace_path):
    jobdir = jobs_dir(workspace_path)
    configs = []
    for job in os.listdir(jobdir):
        conf = os.path.join(jobdir, job, "job.json")
        if file_exists(conf):
            configs.append(read_json(conf))
    return configs


def recreate_workspace(workspace_path):
    recreate_dir(workspace_path)
    create_dir_if_not_exists(projects_dir(workspace_path))
    create_dir_if_not_exists(jobs_dir(workspace_path))
    create_dir_if_not_exists(logs_dir(workspace_path))
    create_dir_if_not_exists(user_dir(workspace_path))
    

def archive_logs(workspace_path):
    logs = logs_dir(workspace_path)
    if os.path.exists(logs):
        new_logs_name = datetime.now().strftime('%Y-%m-%d-%H-%M–%S')
        new_logs_path = os.path.join(workspace_path, f'logs-{new_logs_name}')
        os.rename(logs, new_logs_path)
    create_dir_if_not_exists(logs)


def rename(old, new):
    if file_exists(old) and not file_exists(new):
        os.rename(old, new)
        return True
    return False
