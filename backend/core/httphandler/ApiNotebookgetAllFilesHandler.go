package httphandler

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"
	"github.com/ikemenyuki/Distributed-Code-Running-Server-System/backend/core/shared/service"
	"github.com/ikemenyuki/Distributed-Code-Running-Server-System/backend/core/shared/types"
	pkgErrors "github.com/pkg/errors"
)

func ApiNotebookgetAllFilesHandler(notebookRegistry *service.NotebookRegistry, csrfService *service.CSRFService) HTTPHandler {
	return func(res http.ResponseWriter, req *http.Request) {
		res.Header().Add("Content-Type", "application/json; charset=utf8")
		res.Header().Add("Cache-Control", "max-age=0")

		decoder := json.NewDecoder(req.Body)
		fmt.Print(1234567654321)
		var post struct {
			CSRFToken service.CSRFToken `json:"csrfToken"`
		}
		err := decoder.Decode(&post)
		if err != nil || !csrfService.IsValid(post.CSRFToken) {
			http.Error(res, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			return
		}

		params := mux.Vars(req)
		name, found := params["name"]
		if !found || strings.TrimSpace(name) == "" {
			http.Error(res, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
			return
		}

		notebook, err := notebookRegistry.GetNotebookByName(name)
		if err != nil {
			http.Error(res, http.StatusText(http.StatusNotFound), http.StatusNotFound)
			return
		}

		fileStructures, err := getAllFiles(notebook, notebookRegistry)
		if err != nil {
			http.Error(res, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		response, err := json.Marshal(fileStructures)
		if err != nil {
			http.Error(res, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
			return
		}

		_, _ = res.Write(response)
	}
}

func getAllFiles(notebook types.Notebook, notebookregistry *service.NotebookRegistry) ([]types.FileStructure, error) {
	directory := notebook.GetDirectoryAbsPath()

	var result []types.FileStructure
	err := filepath.Walk(directory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		relativePath, err := filepath.Rel(directory, path)
		if err != nil {
			return err
		}

		if info.IsDir() {
			// Skip the root directory itself
			if path != directory {
				result = append(result, types.FileStructure{
					Type: "folder",
					Name: relativePath,
				})
			}
		} else {
			contentBytes, err := ioutil.ReadFile(path)
			if err != nil {
				return err
			}

			result = append(result, types.FileStructure{
				Type:    "file",
				Name:    relativePath,
				Content: string(contentBytes),
			})
		}
		return nil
	})

	if err != nil {
		return nil, pkgErrors.Wrapf(err, "getAllFiles: could not read files in directory %s", directory)
	}

	if _, err := notebookregistry.Refresh(notebook); err != nil {
		return nil, pkgErrors.Wrapf(err, "getAllFiles: could not refresh descriptor for notebook %s", notebook.GetName())
	}

	return result, nil
}
