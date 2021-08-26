from metaworkspace.workspace import MetacityWorkspace
from argparse import ArgumentParser


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
        mws.reinstall() 
    
    if args.run:
        mws.run()