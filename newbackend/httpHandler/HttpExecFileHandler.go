package httpHandler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"newbackend/typing"
)

func HttpExecFileHandler(w http.ResponseWriter, r *http.Request) {
	enableCors(&w, r)
	// Only allow POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// get the parameters from request body
	var structure typing.FileStructure
	err := json.NewDecoder(r.Body).Decode(&structure)
	if err != nil {
		http.Error(w, "Error parsing request body", http.StatusBadRequest)
		return
	}

	// Save the file
	filePath := structure.UserEmail + "/" + structure.Name
	postBody, _ := json.Marshal(map[string]string{
		"filepath": filePath,
	})
	responseBody := bytes.NewBuffer(postBody)
	resp, err := http.Post("http://localhost:5001/execute", "application/json", responseBody)

	if err != nil {
		fmt.Println("1")
		http.Error(w, "Error executing the file", http.StatusInternalServerError)
		return
	}
	fmt.Println(resp, resp.Body)
	defer resp.Body.Close()
	// Read the response body
	respData, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("2")
		http.Error(w, "Error reading response from file execution", http.StatusInternalServerError)
		return
	}

	// Convert the response body to JSON (assuming it is already JSON)
	var jsonData interface{}
	fmt.Println(string(respData))
	err = json.Unmarshal(respData, &jsonData)
	if err != nil {
		fmt.Println("3")
		http.Error(w, "Error parsing response from file execution", http.StatusInternalServerError)
		return
	}

	// Set the header and write the response back
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(jsonData)

}
