import os
import subprocess
from argparse import ArgumentParser
from getpass import getpass
from bananagl.server.auth import UserAuthenticator


def install(workspace_path: str):
    print(f"Generating secrets...")
    UserAuthenticator.generate(workspace_path)
    print(f"Done.")


def createuser(path: str):
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

    auth = UserAuthenticator(path)  
    auth.create_user(username, fullname, email, pass1, path)
    print(f"Created user {username}. GLHF! =^.^=")


def run(path: str, serve, ip_adress, port):
    os.environ["BANANAPATH"] = path
    if serve:
        os.environ["BANANAENV"] = "LOCAL"
    else:
        os.environ["BANANAENV"] = "PRODUCTION"

    print(f"export BANANAPATH={os.environ['BANANAPATH']}")
    print(f"export BANANAENV={os.environ['BANANAENV']}")
    print(f"The server runs on {ip_adress}:{port}")
    proc = subprocess.Popen(["uvicorn", "bananagl.server.server:app", "--workers", "10", "--host", str(ip_adress), "--port", str(port)])
    return_code = proc.wait()



usage = ("Sets up Metacity Workspace."
         "Downloads all Metacity modules, sets up local installation of Java,"
         "GMLTools")


if __name__ == "__main__":
    parser = ArgumentParser(description=usage)
    parser.add_argument('--install', help='Run the installation process', action="store_true")
    parser.add_argument('--run', help='Run the application server', action="store_true")
    parser.add_argument('--createuser', help='Create new user', action="store_true")
    parser.add_argument('--ip', nargs=1, help='IP adress to run on', default=['127.0.0.1'])
    parser.add_argument('--port', nargs=1, help='Port to run on', default=['5000'])
    parser.add_argument('workspace_dir', type=str, help='Path to newly created Metacity workspace')
    args = parser.parse_args()    
    path = args.workspace_dir

    if args.install:
        install(path)

    if args.createuser:
        createuser(path)

    if args.run:
        run(path, args.ip[0], args.port[0])


