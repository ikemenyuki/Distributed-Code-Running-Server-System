import React, { useEffect, useState, useContext } from "react";
import { parsePath, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Adjust the path as necessary
import CodeEditor from "./CodeEditor";
import FileExplorer from "./FileExplorer";
import ChatBot from "./ChatBot";
import RunButton from "./RunButton";
import { saveCode, askAi, chatAi } from "../utils/api";
import Terminal from "./Terminal";
import { File, Folder } from '../utils/fileTree';
import { languageOptions } from "../constants/languageOptions";
import '../css/Code.css'; // Ensure the CSS is imported


const Code = ({ code, setCode, language, theme }) => {
    const { currentUser } = useContext(AuthContext); // Use AuthContext to get the current user
    const [result, setResult] = useState(''); // State to store the result of the code execution
    const [openTerminal, setOpenTerminal] = useState(false); // State to control the visibility of the terminal
    const [updateTrigger, setUpdateTrigger] = useState(0); // State to trigger re-render
    const [currFilePath, setCurrFilePath] = useState('');
    const navigate = useNavigate();
    const [fileRoot, setFileRoot] = useState(new Folder('root'));
    const [selectedLanguage, setSelectedLanguage] = useState(language.value);

    useEffect(() => {
        const loadedFileRoot = loadFileTreeFromLocalStorage();
        if (loadedFileRoot) {
            console.log(`loadedFileRoot: ${JSON.stringify(loadedFileRoot.serialize())}`)
            setFileRoot(loadedFileRoot);
        } else {
            const froot = new Folder('froot');
            const root = new Folder('root');
            froot.add(root);
            setFileRoot(froot);
        }
    }, []);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login'); // Redirect to login if not logged in
        }
    }, [currentUser, navigate]); // React to changes in currentUser and navigate function


    const saveFileTreeToLocalStorage = (fileRoot) => {
        const serializedFileTree = JSON.stringify(fileRoot.serialize());
        localStorage.setItem('fileTree', serializedFileTree);
    };

    if (!currentUser) {
        return <p>Loading...</p>; // Show loading text while waiting for auth state
    }

    const loadFileTreeFromLocalStorage = () => {
        const savedFileTree = localStorage.getItem('fileTree');
        if (savedFileTree && savedFileTree !== '{"name":"root","type":"folder","children":[]}') {
            console.log(`[loadFileTreeFromLocalStorage] savedFileTree: ${savedFileTree}`)
            const parsedData = JSON.parse(savedFileTree);
            return Folder.fromJSON(parsedData);
        }
        return null;  // Return null if nothing is found
    };

    const handleSave = async () => {
        const command = prompt('Enter a command to run:'); // Prompt the user for a filename
        if (!command) return; // If the user cancels, return early
        console.log(`[handleSave] command: ${command} language: ${selectedLanguage}`)

        // call exec api
        const res = await saveCode(currentUser.email, command, JSON.stringify(fileRoot.children.map(child => child.serialize()), null, 2), selectedLanguage);
        if (res) {
            console.log(`Updating terminal result to: ${res['output']}`);
            setResult(res['output']);
            setOpenTerminal(true);
            setUpdateTrigger(prev => prev + 1);
        } else {
            console.log(`Updating terminal result`);
            setResult('Failed to connect to server.');
            setOpenTerminal(true);
        }
    }

    const handleAskAI = async (message) => {
        console.log(`[handleAskAI] message: ${message}`)
        if (message.startsWith('/debug')) {
            const res = await askAi(JSON.stringify(fileRoot.children.map(child => child.serialize()), null, 2), "Run", result);
            // const res = { ans: "Debug mode activated!" };
            if (res) {
                return res['ans'];
            } else {
                return "Failed to connect to AI."
            }
        } else {
            const res = await chatAi(JSON.stringify(fileRoot.children.map(child => child.serialize()), null, 2), message);
            // const res = { ans: "Debug mode activated!" };
            if (res) {
                return res['ans'];
            } else {
                return "Failed to connect to AI."
            }
        }
    }

    const handleFileClick = (clickedFileName, filePath) => {
        console.log(`File clicked: ${clickedFileName}, Path: ${filePath.join('/')}`);
        // set code of file content
        const curFileObj = fileRoot.find(filePath);
        if (curFileObj.type === 'file') {
            setCode(curFileObj.content);
            setCurrFilePath(filePath.join('/'));
        }
    };

    const handleAddFileClick = (filePath) => {
        const filename = prompt('Enter a filename:');
        if (!filename) return;

        // Use the clone method to create a deep copy
        let newFileRoot = fileRoot.clone();
        const curFolder = newFileRoot.find(filePath);
        if (curFolder && curFolder.type === "folder") {
            const newFile = new File(filename);
            curFolder.add(newFile);
            setFileRoot(newFileRoot);
            setCurrFilePath(filePath.join('/') + "/" + filename);
            saveFileTreeToLocalStorage(fileRoot);
            console.log(currFilePath);
        }
    }

    const handleAddFolderClick = (filePath) => {
        const foldername = prompt('Enter a folder name:');
        if (!foldername) return; // If the user cancels, return early

        console.log(`Add folder clicked: ${foldername}, Path: ${filePath.join('/')}`);

        // Use the clone method to create a deep copy of the fileRoot
        let newFileRoot = fileRoot.clone();
        const curFolder = newFileRoot.find(filePath);
        if (curFolder && curFolder.type === "folder") {
            const newFolder = new Folder(foldername);
            curFolder.add(newFolder);

            // Update the fileRoot state with the newFileRoot which includes the new folder
            setFileRoot(newFileRoot);
            saveFileTreeToLocalStorage(newFileRoot);
            console.log(JSON.stringify(newFileRoot.children.map(child => child.serialize()), null, 2));
        }
    }

    const handleDeleteClick = (event, filePath) => {
        console.log(`Delete button clicked: ${filePath.join('/')}`);
        event.stopPropagation();  // Stop the event from bubbling up to parent elements

        if (!filePath || filePath.length <= 1) return; // If filePath is empty or undefined or root, do nothing.

        let newFileRoot = fileRoot.clone();  // Clone the fileRoot to maintain immutability.
        const parentPath = filePath.slice(0, -1);  // Everything except the last element.
        const entityName = filePath[filePath.length - 1];  // Last element: name of the file or folder to delete.

        const parentFolder = newFileRoot.find(parentPath);  // Find the parent folder.
        if (parentFolder && parentFolder.type === "folder") {
            parentFolder.remove(entityName);  // Remove the entity from the parent folder.
            setFileRoot(newFileRoot);  // Update the state with the new file tree.
            saveFileTreeToLocalStorage(newFileRoot);
            // if filePath is current file, unset current file
            if (filePath.join('/') === currFilePath) {
                setCurrFilePath('');
                setCode('');
            }
        } else {
            console.error("Parent folder not found or path is incorrect.");
        }
    }

    const updateFileContent = (filePath, content) => {
        let newFileRoot = fileRoot.clone();  // Clone the fileRoot to preserve methods
        let fileToUpdate = newFileRoot.find(filePath);  // Assuming filename is the path
        // console.log(`[updateFileContent] filePath: ${filePath} fileToUpdate.type: ${fileToUpdate.type}`)

        if (fileToUpdate && fileToUpdate.type === "file") {
            fileToUpdate.setContent(content);  // Update the content of the file
            setFileRoot(newFileRoot);  // Update the state to trigger re-render
            saveFileTreeToLocalStorage(newFileRoot);
        }
    }

    const handleEditorChange = (newContent) => {
        setCode(newContent);
        updateFileContent(currFilePath, newContent);
    }

    const handleLanguageChange = (event) => {
        setSelectedLanguage(event.target.value);
        console.log(`language change to: ${event.target.value}`);
    }

    return (
        <div class="page-container">
            <div class="file-explorer">
                <FileExplorer fileRoot={fileRoot} onFileClick={handleFileClick} onAddFileClick={handleAddFileClick} onAddFolderClick={handleAddFolderClick} onDeleteClick={handleDeleteClick} />
            </div>
            <div class="editor-container">
                <div class="editor-info">
                    <div>
                        Current File: {currFilePath || "No file selected"}
                    </div>
                    <select
                        class="select-language"
                        value={selectedLanguage}
                        onChange={(e) => handleLanguageChange(e)}
                    >
                        {languageOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <CodeEditor
                    openTerminal={openTerminal}
                    code={code}
                    setCode={setCode}
                    language={selectedLanguage}
                    theme={theme}
                    fileSelected={currFilePath !== ''}
                    handleChange={handleEditorChange}
                />
                {openTerminal && <Terminal updateTrigger={updateTrigger} setOpenTerminal={setOpenTerminal} backendData={result} />}
            </div>
            <div class="tools-container">
                <RunButton handleSave={handleSave} />
                <ChatBot handleAskAI={handleAskAI} />
            </div>
        </div>
    );
}

export default Code;
