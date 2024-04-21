package typing

// TaskStruct defines the structure of a executing task
type TaskStruct struct {
	Language  string   `json:"language"`
	Command   []string `json:"command"`
	Content   string   `json:"content"`
	UserEmail string   `json:"userEmail"`
}
