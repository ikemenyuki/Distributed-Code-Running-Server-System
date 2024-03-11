package httpHandler

import (
	"net/http"
	"os/exec"
)

func HttpExecFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Only GET method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get filename from query parameters
	filename := r.URL.Query().Get("filename")
	if filename == "" {
		http.Error(w, "Filename is required", http.StatusBadRequest)
		return
	}

	// Define the full path
	filePath := pythonDirPath + "/" + filename

	// Execute the file
	cmd := exec.Command("python", filePath)
	output, err := cmd.CombinedOutput()
	if err != nil {
		http.Error(w, "Error executing the file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write(output)
}
