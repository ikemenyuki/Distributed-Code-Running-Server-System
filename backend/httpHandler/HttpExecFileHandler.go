package httpHandler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"newbackend/typing"
	"newbackend/utils"
	"strings"
	"time"
)

func postJobStruct(url string, data typing.JobStruct) (*typing.JobResult, error) {
	// Marshal the requestData into JSON
	jsonData, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}

	// Create a new POST request with the JSON body
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	// Set the content type to application/json
	req.Header.Set("Content-Type", "application/json")

	// Send the request using the http.Client
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// Read the response body
	responseBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// Decode the JSON response into the responseData struct
	var response typing.JobResult
	if err := json.Unmarshal(responseBody, &response); err != nil {
		return nil, err
	}

	// Return the decoded response
	return &response, nil
}

func getJobOutput(JobId string) (*typing.JobOutput, error) {
	// Sending the GET request
	response, err := http.Get(GetJobUrl + JobId)
	if err != nil {
		// Handle error
		fmt.Println("Error getting job output:", err)
		return nil, err
	}

	defer response.Body.Close() // Close the response body when the function returns

	// Reading the response body
	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		// Handle error
		fmt.Println("Error reading getting job response:", err)
		return nil, err
	}

	// Decode the JSON response into the responseData struct
	var responseBody typing.JobOutput
	if err := json.Unmarshal(body, &responseBody); err != nil {
		return nil, err
	}

	// Return the decoded response
	return &responseBody, nil
}

// HttpExecFileHandler handles the HTTP request for executing a project.
// It expects a POST request with a JSON body containing the task structure.
func HttpExecFileHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w, r)

	// Only allow POST requests
	if r.Method != http.MethodPost {
		log.Println("Only POST method is allowed")
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// get the parameters from request body
	var structure typing.TaskStruct
	err := json.NewDecoder(r.Body).Decode(&structure)
	if err != nil {
		http.Error(w, "Error parsing request body", http.StatusBadRequest)
		return
	}

	// print the parsed body
	fmt.Println(structure)

	projectName := strings.Replace(structure.UserEmail, "@", "-", -1)

	baseDir := CodePath + "/" + projectName + "/"

	// Create the file structure based on the provided JSON data
	log.Println("Saving the files")
	if err := utils.CreateFiles(structure.Content, baseDir); err != nil {
		fmt.Println("Error saving the files" + err.Error())
		http.Error(w, "Error saving the files", http.StatusInternalServerError)
		return
	}

	// Data to send in the request
	data := typing.JobStruct{
		Command: structure.Command,
	}

	// Call the sendPostRequest function
	log.Println("Executing the project")
	response, err := postJobStruct(SendJobUrl+projectName, data)
	if err != nil {
		fmt.Println("Error executing the project:", err)
		http.Error(w, "Error executing the project: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Print the response from the server
	fmt.Println("Response Status:", response.Status)
	fmt.Println("Job ID:", response.JobId)

	// Get the output
	log.Println(("Getting Output"))
	outputResponse, err := getJobOutput(response.JobId)
	if err != nil {
		fmt.Println("Error getting Output:", err)
		http.Error(w, "Error getting Output: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Loop until the response status is "success"
	for outputResponse.Status != "success" {
		log.Println("Checking output status again...") // Logging the retry
		time.Sleep(time.Second * 5)                    // Wait for 5 seconds before retrying

		outputResponse, err = getJobOutput(response.JobId) // Attempt to get output again
		if err != nil {
			fmt.Println("Error getting Output:", err)
			http.Error(w, "Error getting Output: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}

	// Print Output
	fmt.Println("Response Status:", outputResponse.Status)
	fmt.Println("Output:", outputResponse.Output)

	// response to frontend
	resp := typing.TaskResponse{
		Output: outputResponse.Output,
	}

	// Set the header and write the response back
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}
