package recipe

import (
	"github.com/ikemenyuki/Distributed-Code-Running-Server-System/backend/core/shared/recipe/helper"
	"github.com/ikemenyuki/Distributed-Code-Running-Server-System/backend/core/shared/types"
)

func Ocaml() types.Recipe {
	return helper.StdRecipe(
		"ocaml",    // key
		"OCaml",    // name
		"OCaml",    // language
		"index.ml", // mainfile
		"mllike",   // cmmode
		"docker.io/ocaml/opam2:alpine",
		func(notebook types.Notebook) []string {
			return []string{"sh", "-c", "ocamlc -o /tmp/code.out /code/" + notebook.GetRecipe().GetMainfile() + " && /tmp/code.out"}
		},
		func(notebook types.Notebook) []string {
			return []string{"sh", "-c", "ocamlc -o /tmp/code.out " + notebook.GetMainFileAbsPath() + " && /tmp/code.out"}
		},
		nil,
		nil,
	)
}
