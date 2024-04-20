FROM python:3.9

COPY requirements.txt /app/requirements.txt
COPY launchJob.py /app/launchJob.py
COPY scheduler.py /app/scheduler.py
COPY jobManager.py /app/jobManager.py
COPY jobQueue.py /app/jobQueue.py
COPY config.py /app/config.py
COPY jobObjects.py /app/jobObjects.py

WORKDIR /app
RUN pip install -r requirements.txt

EXPOSE 5000

CMD ["python", "scheduler.py"]