package typing

// jobResult represents the expected structure of the response JSON data
type JobResult struct {
	Status string `json:"status"`
	Output string `json:"output"`
}

// jobStruct represents the structure of your request JSON data
type JobStruct struct {
	Command []string `json:"command"`
}
