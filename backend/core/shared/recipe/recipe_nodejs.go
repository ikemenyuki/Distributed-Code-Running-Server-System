package recipe

import (
	"github.com/ikemenyuki/Distributed-Code-Running-Server-System/backend/core/shared/recipe/helper"
	"github.com/ikemenyuki/Distributed-Code-Running-Server-System/backend/core/shared/types"
)

func NodeJS() types.Recipe {
	return helper.StdRecipe(
		"nodejs",     // key
		"NodeJS",     // name
		"JavaScript", // language
		"index.js",   // mainfile
		"javascript", // cmmode
		"docker.io/library/node:alpine",
		func(notebook types.Notebook) []string {
			return []string{"node", "--harmony", "/code/" + notebook.GetRecipe().GetMainfile()}
		},
		func(notebook types.Notebook) []string {
			return []string{"node", "--harmony", notebook.GetMainFileAbsPath()}
		},
		nil,
		nil,
	)
}
