package types

import (
	"encoding/json"
	"fmt"
	"path"
)

type Notebook interface {
	GetName() string
	GetAbsdir() string
	GetMtime() string
	SetMtime(mtime string)
	GetRecipe() Recipe
	GetMainFileAbsPath() string
	GetDirectoryAbsPath() string
}

// FileStructure defines the structure of the files and folders
type FileStructure struct {
	Type     string          `json:"type"`
	Name     string          `json:"name"`
	Content  string          `json:"content,omitempty"`
	Children []FileStructure `json:"children,omitempty"`
}

func MakeNotebookReal(notebookname, absdir, mtime string, recipe Recipe) NotebookReal {
	return NotebookReal{
		name:   notebookname,
		absdir: absdir,
		mtime:  mtime,
		recipe: recipe,
	}
}

type NotebookReal struct {
	name   string
	absdir string
	mtime  string
	recipe Recipe
}

func (n *NotebookReal) SetMtime(mtime string) {
	n.mtime = mtime
}

func (n NotebookReal) GetName() string {
	return n.name
}

func (n NotebookReal) GetAbsdir() string {
	return n.absdir
}

func (n NotebookReal) GetMtime() string {
	return n.mtime
}

func (n NotebookReal) GetRecipe() Recipe {
	return n.recipe
}

func (n NotebookReal) MarshalJSON() ([]byte, error) {
	return json.Marshal(&struct {
		Name   string `json:"name"`
		AbsDir string `json:"absdir"`
		MTime  string `json:"mtime"`
		Recipe Recipe `json:"recipe"`
	}{
		Name:   n.GetName(),
		AbsDir: n.GetAbsdir(),
		MTime:  n.GetMtime(),
		Recipe: n.GetRecipe(),
	})
}

func (n NotebookReal) GetMainFileAbsPath() string {
	return path.Join(n.absdir, n.recipe.GetMainfile())
}

func (n *NotebookReal) GetDirectoryAbsPath() string {
	path := path.Join(n.GetAbsdir(), n.GetRecipe().GetDir())
	fmt.Print(path)
	return path
}
