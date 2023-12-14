package recipe

import (
	"github.com/ikemenyuki/Distributed-Code-Running-Server-System/backend/core/shared/recipe/helper"
	"github.com/ikemenyuki/Distributed-Code-Running-Server-System/backend/core/shared/types"
)

func Ruby() types.Recipe {
	return helper.StdRecipe(
		"ruby",    // key
		"Ruby",    // name
		"Ruby",    // language
		"main.rb", // mainfile
		"ruby",    // cmmode
		"docker.io/library/ruby:latest",
		func(notebook types.Notebook) []string {
			return []string{"ruby", "/code/" + notebook.GetRecipe().GetMainfile()}
		},
		func(notebook types.Notebook) []string {
			return []string{"ruby", notebook.GetMainFileAbsPath()}
		},
		nil,
		nil,
	)
}
