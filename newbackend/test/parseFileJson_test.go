package test // Use the same package name as the file you're testing

import (
	"newbackend/utils"
	"testing"
)

func TestCreateFiles(t *testing.T) {
	jsonData := `
    [
  {
    "name": "root",
    "type": "folder",
    "children": [
      {
        "name": "main.py",
        "type": "file",
        "content": "print(\"Hello\")"
      },
      {
        "name": "app",
        "type": "folder",
        "children": [
          {
            "name": "hello.py",
            "type": "file",
            "content": "# hello.py"
          }
        ]
      }
    ]
  }
]
    `

	baseDir := "/tmp/data/xyd000920@outlook.com/"

	// Create the file structure based on the provided JSON data
	if err := utils.CreateFiles(jsonData, baseDir); err != nil {
		t.Errorf("Error creating files: %v", err)
	}
}
