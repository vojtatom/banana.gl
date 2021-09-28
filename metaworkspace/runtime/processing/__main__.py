from metaworkspace.runtime.processing import runners
from metaworkspace.runtime.workspace import mws

if __name__ == "__main__":
    print("Starting Jobs...")
    print(f"{mws.path}")
    manager = runners.JobManager(mws.jobs_dir)
    manager.run()
