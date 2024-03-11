import React from 'react';
import '../css/RunButton.css';

const RunButton = ({ handleSave }) => {
    return (
        <button className="run-button" onClick={handleSave}>
            Save & RUN CODE
        </button>
    );
}

export default RunButton;
