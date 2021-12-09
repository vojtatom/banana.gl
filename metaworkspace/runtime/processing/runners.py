import os
import sys
import time
from multiprocessing import Process, Queue
from typing import List
from metaworkspace.runtime.logging import setup_logging
import logging
import fnmatch

from metaworkspace.runtime.processing.loader import load_job
from watchdog.events import PatternMatchingEventHandler
from watchdog.observers import Observer


def JobWorker(queue: Queue, id: str):
    logid = f'worker{id}'
    setup_logging(logid)
    log = logging.getLogger(logid)

    while True:

        job_dir = queue.get(block=True, timeout=None)
        log.info(f"Worker {id} started: {job_dir}")
        job = load_job(job_dir, log)
        if job is None:
            log.info(f"Worker {id} skipped: {job_dir}")
            continue
        
        try:
            job.run() 
            job.cleanup()
            log.info(f"Worker {id} done: {job_dir}")
        except Exception as e:
            log.error(f"Worker {id}: {job_dir}")
            log.error(e)


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

    @property
    def status(self):
        status = "Runners: "
        for i, w in enumerate(self.workers):
            status += f"[ worker {i} with pid {w.pid} is alive: {w.is_alive()} ], "
        status += f"queue [ full: {self.queue.full()} ] [empty: {self.queue.empty()} ]"
        return status


class EventManager:
    def __init__(self, queue: JobQueue):
        self.queue = queue
        setup_logging('events')

    def on_created(self, event):
        log = logging.getLogger('events')
        log.info(f"{event.src_path}")
        job_dir = os.path.dirname(event.src_path)
        self.queue.add_job(job_dir)


class JobManager:
    def __init__(self, job_directory):
        setup_logging('runners')
        self.patterns = ['job.ready']
        self.ignore_patterns = None
        self.ignore_directories = False
        self.case_sensitive = True
        self.go_recursively = True
        self.job_directory = job_directory
        self.queue = JobQueue()
        self.em = EventManager(self.queue)

    def load_jobs(self):
        for root, dirs, files in os.walk(self.job_directory):
            for name in files:
                if fnmatch.fnmatch(name, 'job.ready'):
                    self.queue.add_job(root)
        
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
        self.load_jobs()
        self.queue.run_workers(1)
        observer = self.observer
        observer.start()
        try:
            #fallback to stop the observer
            while True:
                log = logging.getLogger('runners')
                log.info(self.queue.status)
                time.sleep(15)
                sys.stdout.flush()
                sys.stderr.flush()
        except KeyboardInterrupt:
            observer.stop()
            observer.join()
            self.queue.stop_workers()
