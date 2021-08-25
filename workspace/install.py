import shutil
import os
import requests
import tarfile


JAVA_URL = "https://download.java.net/java/GA/jdk16.0.2/d4a915d82b4c4fbb9bde534da945d746/7/GPL/openjdk-16.0.2_linux-x64_bin.tar.gz"
LOCAL_JAVA_FILE = "java.tar.gz"



def create_dir_if_not_exists(dir):
    if not os.path.exists(dir):
        os.makedirs(dir)


def recreate_dir(dir):
    if os.path.exists(dir):
        shutil.rmtree(dir)
    create_dir_if_not_exists(dir)


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


def install_java(workspace_path):
    java_dir = os.path.join(workspace_path, "java")
    create_dir_if_not_exists(java_dir)    
    java_archive = download_java(java_dir)
    java = extract_archive(java_dir, java_archive)
    java_install = os.path.abspath(os.path.join(java_dir, java))
    return java_install


def reinstall(workspace_path: str):
    config = {}
    recreate_dir(workspace_path)
    config["java"] = install_java(workspace_path)
    return config

