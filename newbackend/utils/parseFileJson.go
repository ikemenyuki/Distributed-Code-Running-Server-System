package utils

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"path/filepath"
)

// Node represents a node in the file tree, either a file or a folder.
type Node struct {
	Name     string `json:"name"`
	Type     string `json:"type"`
	Content  string `json:"content,omitempty"`
	Children []Node `json:"children,omitempty"`
}

// CreateFiles parses JSON data and creates a file tree at the specified base directory.
func CreateFiles(jsonData string, baseDir string) error {
	// Parse JSON data into slice of Nodes
	var nodes []Node
	if err := json.Unmarshal([]byte(jsonData), &nodes); err != nil {
		return err
	}

	// Recursively create the file tree
	for _, node := range nodes {
		if err := createNode(baseDir, node); err != nil {
			return err
		}
	}

	return nil
}

// createNode creates files and directories as per Node definition
func createNode(basePath string, node Node) error {
	currentPath := filepath.Join(basePath, node.Name)

	if node.Type == "folder" {
		// Create directory if it is a folder
		if err := os.MkdirAll(currentPath, 0755); err != nil {
			return err
		}
		// Recursively create children nodes
		for _, child := range node.Children {
			if err := createNode(currentPath, child); err != nil {
				return err
			}
		}
	} else if node.Type == "file" {
		// Create file if it is a file
		if err := ioutil.WriteFile(currentPath, []byte(node.Content), 0644); err != nil {
			return err
		}
	}
	return nil
}
