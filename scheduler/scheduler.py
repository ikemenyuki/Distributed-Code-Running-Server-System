
from utils import DCRSSJob
from jobQueue import JobQueue
from jobManager import JobManager
from flask import Flask, request, jsonify, render_template
# from launchJob import create_job, monitor_job

import os
import kubernetes
import datetime

app = Flask(__name__)

# GET endpoint that accepts a query parameter
@app.route('/', methods=['GET'])
def greet():
    return f'Welcome to Distributed Code Running Server System\'s backend scheduler!'

# submit a job to the job queue
@app.route('/submit/<name>', methods=['POST'])
def submit(name):
    date  = datetime.datetime.now().ctime().replace(' ', '-').replace(':', '-')
    input = request.get_json().get('command', []) # e.g. ["make", "clean"]
    
    jobId = jobQueue.add(DCRSSJob(name=name, date=date, input=input))
    if -1 == jobId:
        return jsonify({'status': 'failed', 'reason': 'JobQueue is full'}), 400
    else:
        return jsonify({'status': 'submitted', 'job id': jobId}), 200

@app.route('/check/<id>', methods=['GET'])
def check(id):
    status, name, date = jobQueue.checkStatusAndOutput(id)
    if status == -1:
        return jsonify({'status': 'pending', 'message': 'your code is pending to run'}), 200
    elif status == 1:
        return jsonify({'status': 'failed', 'message': 'failed to run your code, please submit again'}), 400
    elif status == 0:
        with open(f'/data/{name}/out-{name}-{date}', 'r') as f:
            output = f.read()
        return jsonify({'status': 'success', 'output': output}), 200
    else:
        return jsonify({'status': status, 'message': 'this should not happen'}), 400

@app.route('/check-vis/<id>', methods=['GET'])
def check_vis(id):
    status, name, date = jobQueue.checkStatusAndOutput(id)
    result = {}
    result['status'] = status
    if status == -1:
        result['out'] = ['your code is pending to run']
    elif status == 1:
        result['out'] = ['failed to run your code, please submit again']
    elif status == 0:
        with open(f'/data/{name}/out-{name}-{date}', 'r') as f:
            outlines = f.readlines()
        result['out'] = outlines
    else:
        result['out'] = ['this should not happen']
    return render_template('output.html', result=result)
    
@app.route('/status', methods=['GET'])
def status():
    info = jobQueue.getInfo()
    return render_template('status.html', info=info)


if __name__ == '__main__':
    kubernetes.config.load_incluster_config()
    jobQueue = JobQueue()
    JobManager(jobQueue).start()
    app.run(debug=True, port=5000, host='0.0.0.0')
    