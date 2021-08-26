import shutil
import os
import requests
import tarfile
import zipfile
import json
import metaworkspace.tree as tree


JAVA_URL = "https://download.java.net/java/GA/jdk16.0.2/d4a915d82b4c4fbb9bde534da945d746/7/GPL/openjdk-16.0.2_linux-x64_bin.tar.gz"
GML_TOOLS_URL = "https://github.com/citygml4j/citygml-tools/releases/download/v1.4.2/citygml-tools-1.4.2.zip"
LOCAL_JAVA_FILE = "java.tar.gz"
LOCAL_GML_TOOLS_FILE = "gmltools.zip"


def update_config(config_file, key, value):
    with open(config_file, "w+") as config:
        try:
            data = json.load(config)
        except:
            data = {}
        data[key] = value
        json.dump(data, config)


def download(url, dst):
    data = requests.get(url)
    with open(dst, 'wb') as file:
        file.write(data.content)


def download_java(tools_dir):
    url = JAVA_URL
    dst = os.path.join(tools_dir, LOCAL_JAVA_FILE)
    download(url, dst)
    return dst


def download_gml_tools(tools_dir):
    url = GML_TOOLS_URL
    dst = os.path.join(tools_dir, LOCAL_GML_TOOLS_FILE)
    download(url, dst)
    return dst


def untar(src, dst):
    with tarfile.open(src) as file:
        file.extractall(dst)
    os.remove(src)
    files = os.listdir(dst)
    if len(files) != 1:
        raise Exception(f"Unexpected list of files in extracted directory: {files}")
    return files[0]


def unzip(src, dst):
    with zipfile.ZipFile(src, 'r') as file:
        file.extractall(dst)
    os.remove(src)
    files = os.listdir(dst)
    if len(files) != 1:
        raise Exception(f"Unexpected list of files in extracted directory: {files}")
    return files[0]


def install_java(workspace_path: str):
    tools_dir = tree.tools_dir_module(workspace_path, "java")    
    java_archive = download_java(tools_dir)
    java_dir = untar(java_archive, tools_dir)
    return os.path.abspath(os.path.join(tools_dir, java_dir))


def install_gml_tools(workspace_path: str):
    tools_dir = tree.tools_dir_module(workspace_path, "gmltools")  
    gml_tools_archive = download_gml_tools(tools_dir)
    gml_tools_dir = unzip(gml_tools_archive, tools_dir)
    return os.path.abspath(os.path.join(tools_dir, gml_tools_dir))


def reinstall(workspace_path: str):
    config = {}
    print(f"Creating workspace directory...")
    tree.recreate_workspace(workspace_path)
    print(f"Installing Java...")
    config["java"] = install_java(workspace_path)
    print(f"Installing GML Tools...")
    config["gmltools"] = install_gml_tools(workspace_path)
    return config


