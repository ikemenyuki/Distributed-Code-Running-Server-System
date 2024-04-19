from kubernetes import client, watch

def create_job(image, run_command=None, job_name="default-job", namespace="default"):
    container = client.V1Container(
        name="app-container",
        image=image,
        command=run_command if run_command else ["sleep", "3600"],
        volume_mounts=[
            client.V1VolumeMount(
                name="storage",
                mount_path="/data"
            )
        ]
    )
    
    volumes = [client.V1Volume(
        name="storage",
        persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(
            claim_name="filestore-pvc"
        )
    )]
    
    template = client.V1PodTemplateSpec(
        metadata=client.V1ObjectMeta(labels={"app": "my-app"}),
        spec=client.V1PodSpec(
            containers=[container],
            volumes=volumes,
            restart_policy="OnFailure" 
        )
    )
    
    spec = client.V1JobSpec(
        template=template
    )
    
    job = client.V1Job(
        api_version="batch/v1",
        kind="Job",
        metadata=client.V1ObjectMeta(name=job_name),
        spec=spec
    )

    client.BatchV1Api().create_namespaced_job(
        body=job,
        namespace=namespace
    )

def monitor_job(job_name, namespace="default"):
    w = watch.Watch()
    for event in w.stream(client.BatchV1Api().list_namespaced_job, namespace=namespace):
        job = event['object']    
        if job.metadata.name == job_name and job.status.succeeded == 1:
            w.stop()
            return 0
        elif job.metadata.name == job_name and job.status.failed:
            w.stop()
            return 1



# config.load_incluster_config()
# create_job("tianx1/test_cpp:latest", custom_command=["sleep", "3600"], job_name="test-cpp-1")
