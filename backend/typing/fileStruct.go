package typing

// FileStructure defines the structure of the files and folders
type FileStructure struct {
	Type      string          `json:"type"`
	Name      string          `json:"name"`
	Content   string          `json:"content,omitempty"`
	UserEmail string          `json:"userEmail,omitempty"`
	Children  []FileStructure `json:"children,omitempty"`
}
