
from flask import Flask, request, jsonify
from launchJob import create_job, monitor_job
from jobObjects import DCRSSJob
from jobQueue import JobQueue
from jobManager import JobManager
import kubernetes

import uuid

app = Flask(__name__)

# GET endpoint that accepts a query parameter
@app.route('/greet', methods=['GET'])
def greet():
    # Retrieve the name from the query string
    name = request.args.get('name', 'Guest')
    return f'Hello, {name}!'

# POST endpoint that accepts JSON data
@app.route('/sum', methods=['POST'])
def sum_numbers():
    # Retrieve data from the JSON body of the request
    data = request.get_json()
    # Calculate the sum of the numbers provided in the JSON data
    total = sum(data.get('numbers', []))
    return jsonify({
        'total': total,
        'status': 'success'
    })

@app.route('/submit/<projectId>', methods=['POST'])
def submit(projectId):
    unique_id = str(uuid.uuid4())
    job_name = projectId + "-" + unique_id
    out_path = "/data/" + projectId + "/out-" + unique_id
    data = request.get_json()
    user_command_list = data.get('command', []) # e.g. ["make", "clean"]
    system_command_list = ["/bin/sh", "-c", "cd /data/" + projectId + " && " + " ".join(user_command_list) + ">" + out_path + " 2>&1"]
    print(system_command_list)
    
    try:
        with open("/data/logs/debug.txt", "a") as f:
            f.write("Job name: " + job_name + "\n")
            f.write("Command: " + " ".join(system_command_list) + "\n")
        create_job("tianx1/dcrss-worker:v1", run_command=system_command_list, job_name=job_name)
        if (monitor_job(job_name) == 0):
            with open(out_path, 'r') as f:
                output = f.read()
            return jsonify({'status': 'completed', 'output': output}), 200
        else:
            return jsonify({'status': 'failure'}), 500
        
    except Exception as e:
        jsonify({'error': str(e)}), 500
        
@app.route('/submit1/<projectId>', methods=['POST'])
def submit1(projectId):
    unique_id = str(uuid.uuid4())
    job_name = projectId + "-" + unique_id
    out_path = "/data/" + projectId + "/out-" + unique_id
    data = request.get_json()
    user_command_list = data.get('command', []) # e.g. ["make", "clean"]
    system_command_list = ["/bin/sh", "-c", "cd /data/" + projectId + " && " + " ".join(user_command_list) + ">" + out_path + " 2>&1"]
    
    job = DCRSSJob(outputFile=out_path, name=job_name, input=system_command_list)
    jobQueue.add(job)
    return jsonify({'status': 'submitted'}), 200

if __name__ == '__main__':
    kubernetes.config.load_incluster_config()
    jobQueue = JobQueue()
    JobManager(jobQueue).start()
    app.run(debug=True, port=5000, host='0.0.0.0')
    