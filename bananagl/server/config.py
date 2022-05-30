import os

if "BANANAPATH" in os.environ:
    BPATH = os.environ["BANANAPATH"]
else:
    raise Exception("Trying to import or execute config.py without environment properly set.")

path = BPATH

