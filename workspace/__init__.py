import shutil
import os
import requests
import tarfile
import json


JAVA_URL = "https://download.java.net/java/GA/jdk16.0.2/d4a915d82b4c4fbb9bde534da945d746/7/GPL/openjdk-16.0.2_linux-x64_bin.tar.gz"
LOCAL_JAVA_FILE = "java.tar.gz"


def create_dir_if_not_exists(dir):
    if not os.path.exists(dir):
        os.makedirs(dir)


def recreate_dir(dir):
    if os.path.exists(dir):
        shutil.rmtree(dir)
    create_dir_if_not_exists(dir)


def update_config(config_file, key, value):
    with open(config_file, "w+") as config:
        try:
            data = json.load(config)
        except:
            data = {}
        data[key] = value
        json.dump(data, config)


def config_file(workspace_path):
    return os.path.join(workspace_path, "config.json")


def download_java(java_dir):
    data = requests.get(JAVA_URL)
    dst = os.path.join(java_dir, LOCAL_JAVA_FILE)
    with open(dst, 'wb') as file:
        file.write(data.content)
    return dst


def extract_archive(java_dir, java_archive):
    file = tarfile.open(java_archive)
    file.extractall(java_dir)
    os.remove(java_archive)
    files = os.listdir(java_dir)
    if len(files) != 1:
        raise Exception(f"Unexpected list of files in java directory: {files}")
    return files[0]


def install_java(workspace_path: str):
    java_dir = os.path.join(workspace_path, "java")
    config = config_file(workspace_path)
    
    create_dir_if_not_exists(java_dir)    
    java_archive = download_java(java_dir)
    java = extract_archive(java_dir, java_archive)
    java_install = os.path.abspath(os.path.join(java_dir, java))
    update_config(config, "java", java_install)


def reinstall(workspace_path: str):
    recreate_dir(workspace_path)
    install_java(workspace_path)

