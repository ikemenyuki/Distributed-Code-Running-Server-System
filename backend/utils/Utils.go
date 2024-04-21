package utils

import (
	"log"
	"os"
	"path/filepath"
)

func OpenOrCreateFile(filename string, content string) error {

	// Extract the directory from the filename.
	dir := filepath.Dir(filename)

	// Create the directory if it does not exist.
	if err := os.MkdirAll(dir, 0755); err != nil {
		log.Fatalf("failed to create directory: %v", err)
	}
	file, err := os.OpenFile(filename, os.O_CREATE|os.O_WRONLY, 0666)
	if err != nil {
		log.Fatalf("failed to open or create file '%s': %v", filename, err)
	}
	defer file.Close()

	// Write content to the file
	if _, err := file.WriteString(content); err != nil {
		log.Fatalf("failed to write content to file: %v", err)
		return err
	}

	return nil

}
