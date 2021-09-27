import metaworkspace.filesystem as fs


def reinstall(workspace_path: str):
    print(f"Creating workspace directory...")
    fs.recreate_workspace(workspace_path)


