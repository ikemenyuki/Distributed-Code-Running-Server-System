import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Adjust the path as necessary
import CodeEditor from "./CodeEditor";
import FileExplorer from "./FileExplorer";
import FriendsList from "./FriendsList";
import RunButton from "./RunButton";
import { saveCode } from "../utils/api";

const Code = ({ code, setCode, language, theme }) => {
    const { currentUser } = useContext(AuthContext); // Use AuthContext to get the current user
    const [fileName, setFileName] = useState('');
    const navigate = useNavigate();

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
        const data = await saveCode(currentUser.email, filename, code, language.value);
        console.log(data); // Log the response data
    }

    return (
        <div style={{
            display: 'flex',
        }}>
            <FileExplorer />
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
                    code={code}
                    setCode={setCode}
                    language={language?.value}
                    theme={theme}
                />
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
