import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Adjust the path as necessary
import CodeEditor from "./CodeEditor";
import FileExplorer from "./FileExplorer";
import FriendsList from "./FriendsList";
import RunButton from "./RunButton";
import { saveCode, execCode } from "../utils/api";
import Terminal from "./Terminal";
import { File, Folder } from '../utils/fileTree';

const Code = ({ code, setCode, language, theme }) => {
    const { currentUser } = useContext(AuthContext); // Use AuthContext to get the current user
    const [result, setResult] = useState(''); // State to store the result of the code execution
    const [openTerminal, setOpenTerminal] = useState(false); // State to control the visibility of the terminal
    const [fileName, setFileName] = useState('');
    const navigate = useNavigate();
    const [fileRoot, setFileRoot] = useState(new Folder('root'));
    const [fileSelected, setFileSelected] = useState(false);

    useEffect(() => {
        const froot = new Folder('froot');
        const root = new Folder('root');
        froot.add(root);
        setFileRoot(froot);
    }, []);

    useEffect(() => {
        if (result) {
            setOpenTerminal(true); // Open the terminal if there is backend data
        }
    }, [result]);

    useEffect(() => {
        if (!currentUser) {
            navigate('/login'); // Redirect to login if not logged in
        }
    }, [currentUser, navigate]); // React to changes in currentUser and navigate function

    if (!currentUser) {
        return <p>Loading...</p>; // Show loading text while waiting for auth state
    }

    const handleSave = async () => {
        const filename = fileName || prompt('Enter a filename:'); // Prompt the user for a filename
        if (!filename) return; // If the user cancels, return early
        setFileName(filename); // Set the filename state
        const ok = await saveCode(currentUser.email, filename, code, language.value);
        if (ok) {
            // call exec api
            const res = await execCode(currentUser.email, filename);
            setResult(res['output']);
            setOpenTerminal(true);
        }
    }

    const handleFileClick = (clickedFileName, filePath) => {
        console.log(`File clicked: ${clickedFileName}, Path: ${filePath.join('/')}`);
        // set code of file content
        const curFileObj = fileRoot.find(filePath);
        setFileSelected(curFileObj.type === 'file');
        if (curFileObj.type === 'file') {
            setCode(curFileObj.content);
            setFileName(filePath.join('/'));
            console.log(fileName);
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
            setFileName(filePath.join('/') + "/" + filename);
            console.log(fileName);
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
            console.log(JSON.stringify(newFileRoot.children.map(child => child.serialize()), null, 2));
        }
    }
    }

    return (
        <div style={{
            display: 'flex',
        }}>
            <FileExplorer fileRoot={fileRoot} onFileClick={handleFileClick} onAddFileClick={handleAddFileClick} onAddFolderClick={handleAddFolderClick} />
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                // alignItems: 'flex-end',
                height: 'calc(100vh - 80px)',
                width: '100%',
                // border: '1px solid #ccc',

            }}>
                <CodeEditor
                    openTerminal={openTerminal}
                    code={code}
                    setCode={setCode}
                    language={language?.value}
                    theme={theme}
                    fileSelected={fileSelected}
                />
                {openTerminal && <Terminal setOpenTerminal={setOpenTerminal} backendData={result} />}
            </div>
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                // alignItems: 'flex-end',
                height: 'calc(100vh - 80px)',
                // border: '1px solid #ccc',

            }}>
                <div style={{ height: 'calc(100% - 38.5px)' }}>
                    <RunButton handleSave={handleSave} />
                    <FriendsList />
                </div>

            </div>
        </div>
    );
}

export default Code;
