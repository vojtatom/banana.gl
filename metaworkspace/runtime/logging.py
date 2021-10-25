import logging
import os
from logging.handlers import RotatingFileHandler
from metaworkspace.runtime.workspace import mws 


def setup_logging(name, scrnlog=False, txtlog=True, loglevel=logging.DEBUG):
    print(f"Initializing logger {name}")
    logdir = os.path.abspath(mws.logs_dir)

    if not os.path.exists(logdir):
        os.mkdir(logdir)

    log = logging.getLogger(name)
    log.setLevel(loglevel)

    log_formatter = logging.Formatter("%(asctime)s - %(levelname)s :: %(message)s")

    if txtlog:
        txt_handler = RotatingFileHandler(os.path.join(logdir, f"{name}.log"))
        txt_handler.doRollover()
        txt_handler.setFormatter(log_formatter)
        log.addHandler(txt_handler)
        log.info(f"Logger {name} initialised.")

    if scrnlog:
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(log_formatter)
        log.addHandler(console_handler)

