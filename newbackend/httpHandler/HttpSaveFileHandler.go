package httpHandler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"newbackend/typing"
	"newbackend/utils"
)

func HttpSaveFileHandler(w http.ResponseWriter, r *http.Request) {
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
	err = utils.OpenOrCreateFile(filePath, structure.Content)
	if err != nil {
		http.Error(w, "Error saving the file", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "File uploaded successfully: %s", filePath)
}
