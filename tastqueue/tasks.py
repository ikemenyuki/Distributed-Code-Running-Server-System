from celery import Celery
import subprocess

app = Celery('tasks', backend='redis://localhost', broker='redis://localhost')

backend_path = "/Users/alice/Courses/Project/Distributed-Code-Running-Server-System/newbackend"

@app.task
def execute_task(filepath):
    filepath = backend_path + '/' + filepath
    print('Running python {}'.format(filepath))
    # Run the script and capture the output
    process = subprocess.Popen(['python', filepath], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    stdout, stderr = process.communicate()
    # Get the exit status
    exit_status = process.returncode
    # stdout and stderr are bytes. To convert them to strings, decode them.
    output = stdout.decode()
    error = stderr.decode()
    return {'exit_status': exit_status, 'output': output, 'error': error}