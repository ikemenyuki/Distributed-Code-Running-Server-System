package utils

import (
	"log"
	"os"
)

func OpenOrCreateFile(filename string, content string) error {
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
