package httpHandler

import (
	"encoding/json"
	"io/ioutil"
	"log"

	"net/http"
	"newbackend/typing"
	"os"
)

func HttpGetAllFilesHandler(w http.ResponseWriter, r *http.Request) {
	// Set the directory path
	dir := pythonDirPath

	// Read the directory contents
	files, err := os.ReadDir(dir)
	if err != nil {
		log.Printf("Error reading directory: %v", err) // Log the specific error
		http.Error(w, "Cannot read directory", http.StatusInternalServerError)
		return
	}

	var fileStructures []typing.FileStructure
	for _, file := range files {
		fileInfo, err := file.Info()
		if err != nil {
			// Handle error or continue
			continue
		}

		fileStructure := typing.FileStructure{
			Name: file.Name(),
			Type: determineFileType(fileInfo),
		}

		// Read file content if it's a file
		if !fileInfo.IsDir() {
			content, err := ioutil.ReadFile(dir + "/" + file.Name())
			if err != nil {
				// Handle error or continue
				continue
			}
			fileStructure.Content = string(content)
		}

		fileStructures = append(fileStructures, fileStructure)
	}

	// Convert the file structures to JSON
	jsonResponse, err := json.Marshal(fileStructures)
	if err != nil {
		http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
		return
	}

	// Set Content-Type header
	w.Header().Set("Content-Type", "application/json")
	w.Write(jsonResponse)
}

// Helper function to determine the file type
func determineFileType(fileInfo os.FileInfo) string {
	if fileInfo.IsDir() {
		return "directory"
	}
	return "file"
}
