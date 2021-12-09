import os
import shutil
import uuid
import json
import ntpath
from datetime import datetime

# basics
def filename(file_path):
    return ntpath.basename(file_path)


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


def exports_dir(workspace_path):
    return os.path.join(workspace_path, "exports")


def export_dir(workspace_path, export_id):
    return os.path.join(exports_dir(workspace_path), export_id)


def export_file(workspace_path, export_id):
    return os.path.join(export_dir(workspace_path, export_id), "export.json")


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


def process_file(workspace_path):
    return os.path.join(workspace_path, "pid")


def project_dir(workspace_path, project_name):
    return os.path.join(projects_dir(workspace_path), project_name)


def get_projects(workspace_path):
    projects = projects_dir(workspace_path)
    for project in os.listdir(projects):
        if project[0] != '.':
            yield os.path.join(projects, project)

def get_project_names(workspace_path):
    projects = projects_dir(workspace_path)
    for project in os.listdir(projects):
        if project[0] != '.':
            yield project

def current_jobs(workspace_path):
    jobs = jobs_dir(workspace_path)
    return [job for job in os.listdir(jobs)]

def current_exports(workspace_path):
    exports = exports_dir(workspace_path)
    return [export for export in os.listdir(exports) if export[0] != '.']

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

def generate_export_dir(workspace_path):
    exports = exports_dir(workspace_path)
    names = current_exports(workspace_path)
    eid = str(uuid.uuid4())
    while eid in names:
        eid = str(uuid.uuid4())
    export_dir = os.path.join(exports, eid)
    create_dir_if_not_exists(export_dir)
    return export_dir


def id_from_jobdir(jobdir):
    return os.path.basename(jobdir)


def current_job_configs(workspace_path):
    jobdir = jobs_dir(workspace_path)
    configs = []
    for job in os.listdir(jobdir):
        conf = os.path.join(jobdir, job, "job.json")
        if file_exists(conf):
            try:
                configs.append(read_json(conf))
            except:
                pass
    return configs


def recreate_workspace(workspace_path):
    #if os.path.exists(workspace_path):
    #    print(f"Workspace {workspace_path} already exists. If you wish to recreate it, please remove it first.")

    create_dir_if_not_exists(workspace_path)
    create_dir_if_not_exists(projects_dir(workspace_path))
    create_dir_if_not_exists(jobs_dir(workspace_path))
    create_dir_if_not_exists(logs_dir(workspace_path))
    create_dir_if_not_exists(user_dir(workspace_path))
    create_dir_if_not_exists(exports_dir(workspace_path))
    

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


def export_obj_file(export_dir: str):
    return os.path.join(export_dir, "export.obj")


def export_dir_json(export_dir: str):
    return os.path.join(export_dir, "export.json")
