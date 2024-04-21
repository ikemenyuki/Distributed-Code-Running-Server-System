package typing

// jobResult represents the expected structure of the response JSON data
type JobResult struct {
	Status string `json:"status"`
	JobId  string `json:"job id"`
}

// jobStruct represents the structure of your request JSON data
type JobStruct struct {
	Command []string `json:"command"`
}

//	{
//		"output": "./hello_world\nHello World!\n",
//		"status": "success"
//	  }
type JobOutput struct {
	Status string `json:"status"`
	Output string `json:"output"`
}
