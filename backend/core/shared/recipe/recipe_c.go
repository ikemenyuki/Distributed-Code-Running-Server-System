package recipe

import (
	"github.com/ikemenyuki/Distributed-Code-Running-Server-System/backend/core/shared/recipe/helper"
	"github.com/ikemenyuki/Distributed-Code-Running-Server-System/backend/core/shared/types"
)

func C() types.Recipe {
	return helper.StdRecipe(
		"c",      // key
		"c11",    // name
		"C",      // language
		"main.c", // mainfile
		"clike",  // cmmode
		"docker.io/library/gcc:latest",
		func(notebook types.Notebook) []string {
			return []string{"sh", "-c", "gcc -Wall -Wextra -Werror -o /tmp/code.out /code/" + notebook.GetRecipe().GetMainfile() + " && /tmp/code.out"}
		},
		func(notebook types.Notebook) []string {
			return []string{"sh", "-c", "gcc -Wall -Wextra -Werror -o /tmp/code.out '" + notebook.GetMainFileAbsPath() + "' && /tmp/code.out"}
		},
		nil,
		nil,
	)
}
