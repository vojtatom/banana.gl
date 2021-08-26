import os
import subprocess


def print_output(proc):
    for line in iter(proc.stdout.readline, b""):
        print(line.decode("utf-8"), end="")


def run(workspace_path: str):
    os.environ["METACITYWS"] = workspace_path

    proc = subprocess.Popen(["uvicorn", "metaworkspace.api.api:app", "--reload", "--port", "5000"], 
                            stdout=subprocess.PIPE,
                            stderr=subprocess.STDOUT)
                 
    print_output(proc)
    return_code = proc.wait()
    return return_code


