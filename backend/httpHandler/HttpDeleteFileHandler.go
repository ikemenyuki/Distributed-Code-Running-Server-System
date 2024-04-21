package httpHandler

import (
	"fmt"
	"net/http"
	"os"
)

func HttpDeleteFileHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		http.Error(w, "Only DELETE method is allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get filename from query parameters
	filename := r.URL.Query().Get("filename")
	if filename == "" {
		http.Error(w, "Filename is required", http.StatusBadRequest)
		return
	}

	filePath := pythonDirPath + "/" + filename

	// Delete the file
	err := os.Remove(filePath)
	if err != nil {
		http.Error(w, "Error deleting the file", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, "File deleted successfully: %s", filePath)
}
