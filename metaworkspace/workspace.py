import os
from metaworkspace import filesystem as fs
from metacity.datamodel.project import Project
from passlib.context import CryptContext
from secrets import token_bytes
import binascii
import subprocess

class UserAuthenticator:
    def __init__(self, workspace_path: str):
        self.user_dir = fs.user_dir(workspace_path)
        self.config = fs.read_json(fs.security_config(workspace_path))
        self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    @staticmethod
    def generate(workspace_path: str):
        config = fs.security_config(workspace_path)
        fs.write_json(config, {
            'secret': binascii.hexlify(token_bytes(32)).decode("ascii")
        })

    def get_user(self, username):
        file = fs.user_file(self.user_dir, username)
        if fs.file_exists(file):
            return fs.read_json(file)
        return None

    @property
    def secret(self):
        return self.config['secret']

    def get_password_hash(self, password):
        return self.pwd_context.hash(password)

    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def create_user(self, username, fullname, password, email):
        file = fs.user_file(self.user_dir, username)
        if fs.file_exists(file):
            raise Exception("User already exists")

        user = {
            'username': username,
            'full_name': fullname,
            'password': self.get_password_hash(password),
            'email': email
        }
        fs.write_json(file, user)

    def verify_user(self, username, password):
        user = self.get_user(username)
        if not user:
            return None
        if not self.verify_password(password, user['password']):
            return None
        return user


class ProcessManager:
    def __init__(self, workspace_path: str):
        self.config = fs.process_file(workspace_path)

    def export_pid(self):
        pid = os.getpid()
        if os.path.exists(self.config):
            pid = self.pid
            if pid is None:
                raise Exception("Workspace is in invalid state, pid file is present in workspace dir, however it does not contain valid PID")
            raise Exception(f"Workspace is already running as process {pid} or the process was killed before, stop the process:\n    python -m metaworkspace --stop <workspace name>")
        
        pid = os.getpid()
        print(f"Running as process with PID {pid}")
        with open(self.config, "w") as f:
            f.write(str(pid))

    @property
    def pid(self):
        try:
            with open(self.config, "r") as f:
                pid = f.read()
            return int(pid)
        except:
            return None

    def stop(self, stop_in_background=True):
        if stop_in_background:
            pid = self.pid
            if pid is None:
                raise Exception("Cannot stop process since the PID is unknown, please stop process manually")
            print(f"Trying to kill running workspace with pid {pid}...")
            subprocess.run(["kill", "-9", str(-pid)])

        if os.path.exists(self.config):
            os.remove(self.config)


class MetacityWorkspace:
    def __init__(self, workspace_path: str):
        self.path = os.path.abspath(workspace_path)
        self.security = UserAuthenticator(self.path)
        fs.recreate_workspace(self.path)

    @property
    def projects_dir(self):
        return fs.projects_dir(self.path)

    @property
    def exports_dir(self):
        return fs.exports_dir(self.path)

    @property
    def jobs_dir(self):
        return fs.jobs_dir(self.path)

    @property
    def logs_dir(self):
        return fs.logs_dir(self.path)

    @property
    def project_names(self):
        return fs.get_project_names(self.path)

    @property
    def projects(self):
        for prj_dir in fs.get_projects(self.path):
            yield Project(prj_dir)

    def create_project(self, name: str):
        prj = fs.project_dir(self.path, name)
        fs.create_dir_if_not_exists(prj)
        return Project(prj)

    def get_project(self, name: str):
        if name not in self.project_names:
            return None
        prj = fs.project_dir(self.path, name)
        fs.create_dir_if_not_exists(prj)
        return Project(prj)

    def delete_project(self, name: str):
        prj = fs.project_dir(self.path, name)
        fs.remove_dirtree(prj)

    def rename_project(self, old_name, new_name):
        old_dir = fs.project_dir(self.path, old_name)
        new_dir = fs.project_dir(self.path, new_name)
        return fs.rename(old_dir, new_dir)   

    @property
    def server_log(self):
        return fs.server_log(self.path) 

    @property
    def jobs_log(self):
        return fs.jobs_log(self.path) 

    def generate_job_dir(self):
        return fs.generate_job_dir(self.path)

    def generate_export_dir(self):
        return fs.generate_export_dir(self.path)

    def clear_logs(self):
        fs.archive_logs(self.path)

    def get_current_job_configs(self):
        return fs.current_job_configs(self.path)

    def get_exports(self):
        return [ export_dir for export_dir in fs.current_exports(self.path)]

    def export_exists(self, export_id):
        return os.path.exists(fs.export_dir(self.path, export_id))

    def get_log(self, log_name):
        return fs.log_contents(self.path, log_name)

    def get_logs(self):
        return fs.current_logs(self.path)
