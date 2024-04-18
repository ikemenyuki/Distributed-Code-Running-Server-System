package main

import (
	"fmt"
	"net/http"
	"newbackend/httpHandler"
)

func main() {
	http.Handle("/api/execute", http.HandlerFunc(httpHandler.HttpExecFileHandler))
	http.Handle("/api/create", http.HandlerFunc(httpHandler.HttpCreateFileHandler))
	http.Handle("/api/delete", http.HandlerFunc(httpHandler.HttpDeleteFileHandler))
	http.Handle("/api/getAllFiles", http.HandlerFunc(httpHandler.HttpGetAllFilesHandler))
	fmt.Print("Server is running on port 8085")
	http.ListenAndServe(":8085", nil)
}
