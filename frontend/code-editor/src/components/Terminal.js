import React, { useState, useEffect, useRef } from 'react';
import '../css/Terminal.css'; // Make sure to create a Terminal.css file for styling

const Terminal = ({ updateTrigger, setOpenTerminal, backendData }) => {
    const [terminalLines, setTerminalLines] = useState(['Welcome to the code output terminal!']);
    const endOfTerminalRef = useRef(null);
    const lastBackendDataRef = useRef();

    useEffect(() => {
        console.log("Updating terminal lines with:", backendData);
        setTerminalLines(prevLines => [...prevLines, "Your current code output:\n" + backendData]);
        lastBackendDataRef.current = backendData;
    }, [updateTrigger]);

    useEffect(() => {
        // Scroll to the bottom of the terminal whenever lines are added
        endOfTerminalRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [terminalLines]);

    const handleCloseTerminal = () => {
        setOpenTerminal(false);
    };

    return (
        <div className="terminal">
            <button className="terminal-close-btn" onClick={handleCloseTerminal}>x</button>
            {terminalLines.map((line, index) => (
                <div key={index} className="terminal-line">
                    {line}
                </div>
            ))}
            <div ref={endOfTerminalRef} />
        </div>
    );
};

export default Terminal;
