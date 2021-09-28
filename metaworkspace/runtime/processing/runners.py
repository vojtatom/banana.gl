import time
from watchdog.observers import Observer
from watchdog.events import PatternMatchingEventHandler
from multiprocessing import Process, Queue
import sys
import json
import os
from typing import List

from metaworkspace.runtime.processing.loader import job_object_hook


def JobWorker(queue: Queue, id: str):
    while True:
        action = queue.get(block=True, timeout=None)
        print(f"Worker {id}", action)
        sys.stdout.flush()
        jobfile = os.path.join(os.path.dirname(action), 'job.json')
        with open(jobfile, 'r') as job_file:
            job = json.load(job_file, object_hook=job_object_hook)
        try:
            job.run()
        except Exception as e:
            print(e)
        sys.stdout.flush()



class JobQueue:
    def __init__(self):
        self.queue = Queue()
        self.workers: List[Process] = []

    def run_workers(self, worker_count):
        for i in range(worker_count):
            p = Process(target=JobWorker, args=(self.queue, i))
            p.start()
            self.workers.append(p)

    def stop_workers(self):
        for p in self.workers:
            p.terminate()

    def add_job(self, job):
        self.queue.put(job)


class EventManager:
    def __init__(self, queue: JobQueue):
        self.queue = queue

    def on_created(self, event):
        print(f"hey, {event.src_path} has been created!")
        self.queue.add_job(event.src_path)



class JobManager:
    def __init__(self, job_directory):
        self.patterns = ["job.ready"]
        self.ignore_patterns = None
        self.ignore_directories = False
        self.case_sensitive = True
        self.go_recursively = True
        self.job_directory = job_directory
        self.queue = JobQueue()
        self.em = EventManager(self.queue)
        
    @property
    def event_handler(self):
        eh = PatternMatchingEventHandler(
            self.patterns, self.ignore_patterns, 
            self.ignore_directories, self.case_sensitive)
        eh.on_created = self.em.on_created
        return eh

    @property
    def observer(self):
        o = Observer()
        o.schedule(
            self.event_handler, self.job_directory, 
            recursive=self.go_recursively)
        return o

    def run(self):
        self.queue.run_workers(2)
        observer = self.observer
        observer.start()
        try:
            #fallback to stop the observer
            while True:
                time.sleep(1)
                sys.stdout.flush()
                sys.stderr.flush()
        except KeyboardInterrupt:
            observer.stop()
            observer.join()
            self.queue.stop_workers()
