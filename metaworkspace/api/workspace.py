from metaworkspace.workspace import MetacityWorkspace
import os

if "METACITYWS" in os.environ:
    MWSPATH = os.environ["METACITYWS"]
else:
    raise Exception("Trying to import or execute api.py without environment properly set.")

#This should be done better, but it's the only option how to avoid creatign the instance upon every request
#Since this is only OOI encapsulating a couple of files, it's arguably okay
mws = MetacityWorkspace(MWSPATH)

