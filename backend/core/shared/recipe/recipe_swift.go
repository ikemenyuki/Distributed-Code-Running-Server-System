package recipe

import (
	"github.com/ikemenyuki/Distributed-Code-Running-Server-System/backend/core/shared/recipe/helper"
	"github.com/ikemenyuki/Distributed-Code-Running-Server-System/backend/core/shared/types"
)

func Swift() types.Recipe {
	return helper.StdRecipe(
		"swift",      // key
		"Swift",      // name
		"Swift",      // language
		"main.swift", // mainfile
		"swift",      // cmmode
		"docker.io/library/swift:latest",
		func(notebook types.Notebook) []string {
			return []string{"swift", "/code/" + notebook.GetRecipe().GetMainfile()}
		},
		func(notebook types.Notebook) []string {
			return []string{"swift", notebook.GetMainFileAbsPath()}
		},
		nil,
		nil,
	)
}
