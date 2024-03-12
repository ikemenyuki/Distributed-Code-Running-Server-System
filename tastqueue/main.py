from tasks import execute_task
from flask import Flask, request, jsonify, make_response
import time
from flask_cors import CORS

def submit_task(filepath):
    """
    Submits a new task to run the specified Python script.
    
    Args:
        filepath: The path to the Python script to execute.
    
    Returns:
        A Celery AsyncResult instance representing the submitted task.
    """
    # Submit a new task to Celery and return the AsyncResult
    return execute_task.delay(filepath)

# Example usage:
# if __name__ == "__main__":
#     # Submit multiple tasks and collect their AsyncResults
#     results = []
#     filepaths = ['test1.py', 'test2.py', 'test3.py']  # Add your file paths here
#     for filepath in filepaths:
#         result = submit_task(filepath)
#         results.append(result)

#     while results:
#         for result in list(results):  # Use list(results) to make a copy of results for safe iteration
#             if result.ready():
#                 print(f'Result for {result.id}:', result.get())  # No need for timeout here, as result is ready
#                 results.remove(result)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/execute', methods=['POST'])
def execute():
    # Extract the filepath from the request's JSON body
    data = request.get_json()
    
    # Check if the filepath is provided
    if not data or 'filepath' not in data:
        # If no filepath was provided, return an error response
        response = {'error': 'No filepath provided'}
        return make_response(jsonify(response), 400)  # 400 Bad Request

    filepath = data['filepath']
    result = submit_task(filepath)

    # Initialize a counter for the number of checks
    check_count = 0
    max_checks = 20  # Adjust based on your expected task duration and acceptable response time

    while not result.ready() and check_count < max_checks:
        # Check if the task is still running
        print(f'Task {result.id} is still running...')
        # Increment the check counter
        check_count += 1
        # Wait for 0.5 second before checking again, but do not block indefinitely
        time.sleep(0.5)  # Make sure to import time at the top of your file

    if result.ready():
        print(f'Result for {result.id}:', result.get())  # No need for timeout here, as result is ready
        # Return the response as a JSON object with a 200 OK status
        return make_response(jsonify(result.get()), 200)  # 200 OK
    else:
        # Task is still running, return a response indicating this
        return make_response(jsonify({'status': 'pending', 'task_id': result.id}), 202)  # 202 Accepted

if __name__ == '__main__':
    app.run(port=5001, debug=True)
