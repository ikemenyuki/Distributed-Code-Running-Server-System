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

	baseDir := utils.CodePath + "/" + projectName + "/"

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
	fmt.Println("Output:", response.Output)

	resp := typing.TaskResponse{
		Output: response.Output,
	}

	// Set the header and write the response back
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}
