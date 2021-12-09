import os
import subprocess
from argparse import ArgumentParser
from getpass import getpass

from metacity.core.migrate import migrate
import metaworkspace.filesystem as fs
from metaworkspace.workspace import MetacityWorkspace, UserAuthenticator, ProcessManager


def install(workspace_path: str):
    print(f"Creating workspace directory...")
    fs.remove_dirtree(workspace_path)
    fs.recreate_workspace(workspace_path)
    print(f"Generating secrets...")
    UserAuthenticator.generate(workspace_path)
    print(f"Done.")


def regen(workspace_path: str):
    secret = fs.security_config(workspace_path)
    if fs.file_exists(secret):
        os.remove(secret)
    print(f"Generating secrets...")
    UserAuthenticator.generate(workspace_path)
    print(f"Done.")


def createuser(mws: MetacityWorkspace):
    print(f"Generating new user...")
    username =    input("username:              ")
    fullname =    input("full name:             ")
    email =       input("email:                 ")
    while True:
        pass1 = getpass("password (first time): ")
        pass2 = getpass("password (again):      ")
        if pass1 != pass2:
            print("Passwords do not match, try again.")
        else:
            break
    mws.security.create_user(username, fullname, pass1, email)
    print(f"Created user {username}. GLHF! =^.^=")


def migrate_workspace(mws: MetacityWorkspace):
    for project in mws.projects:
        migrate(project)


def stop(mws: MetacityWorkspace):
    p = ProcessManager(mws.path)
    p.stop()


def run(mws: MetacityWorkspace, serve, ip_adress, port):
    p = ProcessManager(mws.path)
    p.export_pid()

    print(f"For more information, see logs located in directory {mws.logs_dir}.")
    os.environ["METACITYWS"] = mws.path
    print(f"export METACITYWS={mws.path}")
    print(f"Running workers...")
    mws.clear_logs()

    server_log = open(mws.server_log, 'w+')
    jobs_log = open(mws.jobs_log, 'w+')
    
    if serve:
        print(f"The server runs on {ip_adress}:{port}")
        proc = subprocess.Popen(["uvicorn", "metaworkspace.runtime.api.server:app", "--workers", "10", "--host", str(ip_adress), "--port", str(port)], 
                                stdout=server_log,
                                stderr=server_log)

    jobs = subprocess.Popen(["python", "-m", "metaworkspace.runtime.processing"], 
                            stdout=jobs_log,
                            stderr=jobs_log)
    if serve:            
        return_code = proc.wait()
    return_code = jobs.wait()
    p.stop(stop_in_background=False)


usage = ("Sets up Metacity Workspace."
         "Downloads all Metacity modules, sets up local installation of Java,"
         "GMLTools")


if __name__ == "__main__":
    parser = ArgumentParser(description=usage)
    parser.add_argument('--install', help='Run the installation process', action="store_true")
    parser.add_argument('--run', help='Run the application workers', action="store_true")
    parser.add_argument('--serve', help='Run the application server', action="store_true")
    parser.add_argument('--regen', help='Re-generate the secret of the app, it will disable access to all existing users', action="store_true")
    parser.add_argument('--createuser', help='Create new user', action="store_true")
    parser.add_argument('--ip', nargs=1, help='IP adress to run on', default=['127.0.0.1'])
    parser.add_argument('--port', nargs=1, help='Port to run on', default=['5000'])
    parser.add_argument('--migrate', help='Migrate existing projects after installation of newer version', action="store_true")
    parser.add_argument('--stop', help='Will try to stop the running workspace if pid file is in working directory', action="store_true")
    parser.add_argument('workspace_dir', type=str, help='Path to newly created Metacity workspace')
    args = parser.parse_args()    
    path = args.workspace_dir

    if args.install:
        install(path)

    if args.regen:
        regen(path)

    try:
        mws = MetacityWorkspace(path)
    except Exception as e:
        print(e)
        print("Could not open the environemnt, please check if the name is right and the secret key is present.")
        quit()

    if args.stop:
        stop(mws)

    if args.createuser:
        createuser(mws)

    if args.migrate:
        migrate_workspace(mws)

    if args.run:
        run(mws, args.serve, args.ip[0], args.port[0])


