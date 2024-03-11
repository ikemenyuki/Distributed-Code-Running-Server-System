import React, { useState, useEffect } from "react";

import Editor from "@monaco-editor/react";

const CodeEditor = ({ language, code, setCode, theme }) => {

    const handleEditorChange = (code) => {
        setCode(code);
    };

    return (
        <div className="overlay rounded-md overflow-hidden w-full h-full shadow-4xl border border-sky-500">
            <Editor
                height="calc(100vh - 80px)"
                width="90vh"
                language={language || "python"}
                value={code}
                theme={theme}
                defaultValue="# Start coding!"
                onChange={handleEditorChange}
                setCode={setCode}
            />
        </div>
    );
};
export default CodeEditor;