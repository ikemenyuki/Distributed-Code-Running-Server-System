import React, { useState } from "react";

import Editor from "@monaco-editor/react";

const CodeEditor = ({ onChange, language, code, theme }) => {
    const [value, setValue] = useState(code || "");

    const handleEditorChange = (value) => {
        setValue(value);
        onChange("code", value);
    };

    return (
        <div className="overlay rounded-md overflow-hidden w-full h-full shadow-4xl border border-sky-500">
            <Editor
                height="calc(100vh - 80px)"
                width="90vh"
                language={language || "javascript"}
                value={value}
                theme={theme}
                defaultValue="// some comment"
                onChange={handleEditorChange}
            />
        </div>
    );
};
export default CodeEditor;