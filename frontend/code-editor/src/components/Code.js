import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // Adjust the path as necessary
import CodeEditor from "./CodeEditor";
import FileExplorer from "./FileExplorer";
import FriendsList from "./FriendsList";

const Code = ({ code, onChange, language, theme }) => {
    const { currentUser } = useContext(AuthContext); // Use AuthContext to get the current user
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser) {
            navigate('/login'); // Redirect to login if not logged in
        }
    }, [currentUser, navigate]); // React to changes in currentUser and navigate function

    if (!currentUser) {
        return <p>Loading...</p>; // Show loading text while waiting for auth state
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
                    onChange={onChange}
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
                <FriendsList />
            </div>
        </div>
    );
}

export default Code;
