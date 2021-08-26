from metaworkspace.workspace import MetacityWorkspace
from argparse import ArgumentParser


usage = ("Sets up Metacity Workspace."
         "Downloads all Metacity modules, sets up local installation of Java,"
         "GMLTools")


if __name__ == "__main__":
    parser = ArgumentParser(description=usage)
    parser.add_argument('workspace_dir', type=str, help='Path to newly created Metacity workspace')
    args = parser.parse_args()    
    path = args.workspace_dir
    mws = MetacityWorkspace(path)
    mws.reinstall() 