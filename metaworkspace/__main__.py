from metaworkspace.workspace import MetacityWorkspace
from argparse import ArgumentParser
import metaworkspace.filesystem as fs
import os
import subprocess


def install(workspace_path: str):
    print(f"Creating workspace directory...")
    fs.recreate_workspace(workspace_path)


def run(mws: MetacityWorkspace):
    os.environ["METACITYWS"] = mws.path
    server_log = open(mws.server_log, 'w+')
    jobs_log = open(mws.jobs_log, 'w+')
    
    proc = subprocess.Popen(["uvicorn", "metaworkspace.runtime.api.api:app", "--workers", "4", "--port", "5000"], 
                            stdout=server_log,
                            stderr=server_log)

    jobs = subprocess.Popen(["python", "-m", "metaworkspace.runtime.processing"], 
                            stdout=jobs_log,
                            stderr=jobs_log)
                 
    return_code = proc.wait()
    #print(return_code)
    return_code = jobs.wait()
    print(return_code)


usage = ("Sets up Metacity Workspace."
         "Downloads all Metacity modules, sets up local installation of Java,"
         "GMLTools")


if __name__ == "__main__":
    parser = ArgumentParser(description=usage)
    parser.add_argument('--install', help='Run the installation process', action="store_true")
    parser.add_argument('--run', help='Run the application', action="store_true")
    parser.add_argument('workspace_dir', type=str, help='Path to newly created Metacity workspace')
    args = parser.parse_args()    
    path = args.workspace_dir
    mws = MetacityWorkspace(path)

    if args.install:
        install(mws.path)
    
    if args.run:
        run(mws)