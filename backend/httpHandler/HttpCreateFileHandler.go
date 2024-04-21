package httpHandler

import (
	"fmt"
	"io/ioutil"
	"net/http"
)

func HttpCreateFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Only POST method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse the form
	err := r.ParseForm()
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}

	// Retrieve filename and content from form
	filename := r.FormValue("filename")
	content := r.FormValue("content")

	if filename == "" {
		http.Error(w, "Filename is required", http.StatusBadRequest)
		return
	}

	filePath := pythonDirPath + "/" + filename

	// Create and write to the file
	err = ioutil.WriteFile(filePath, []byte(content), 0644)
	if err != nil {
		http.Error(w, "Error writing to the file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "File created successfully: %s", filePath)
}
