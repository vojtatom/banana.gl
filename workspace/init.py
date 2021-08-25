import os


def setup_java(config):
    #only available in subshell
    os.environ["PATH"] = f"{config['java']}/bin:{os.environ['PATH']}"
    os.environ["JAVA_HOME"] = f"{config['java']}/"
