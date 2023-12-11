import React, { useState } from 'react';
import '../css/FileExplorer.css';
import initialFileStructure from '../constants/fileStructure';

const FileExplorer = () => {
    const [fileStructure, setFileStructure] = useState(initialFileStructure);

    // Function to sort files and directories
    const sortItems = (a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
    };

    // Function to handle right-click on an item
    const handleContextMenu = (event, item) => {
        event.preventDefault();
        console.log(`Right-clicked on ${item.name}`);
        // Implement context menu functionality here
    };

    // Function to add a new file or directory
    const addNewItem = (type, parentPath = []) => {
        console.log(`Add new ${type}`);
        // Implement add functionality here
    };

    // Function to delete an item
    const deleteItem = (path) => {
        console.log(`Delete item at ${path}`);
        // Implement delete functionality here
    };

    const FileItem = ({ item, path = [] }) => {
        const [isOpen, setIsOpen] = useState(false);
        const isFolder = item.type === 'folder';

        const toggle = () => {
            if (isFolder) setIsOpen(!isOpen);
        };

        const iconClassName = isFolder ? (isOpen ? 'fa-folder-open' : 'fa-folder') : 'fa-file-code-o';

        return (
            <>
                <div
                    className={`file-item ${item.type}`}
                    onClick={toggle}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                    style={{ cursor: 'pointer' }}
                >
                    <i className={`fa ${iconClassName}`} style={{ marginRight: '5px' }}></i>
                    {item.name}
                    <div className="actions">
                        <i className="fa fa-plus" onClick={() => addNewItem(isFolder ? 'folder' : 'file', path)}></i>
                        <i className="fa fa-trash" onClick={() => deleteItem(path)}></i>
                    </div>
                </div>
                {isOpen && isFolder && (
                    <div className="nested">
                        {item.children.sort(sortItems).map((child, index) => (
                            <FileItem key={index} item={child} path={[...path, child.name]} />
                        ))}
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="file-explorer">
            {fileStructure.sort(sortItems).map((item, index) => (
                <FileItem key={index} item={item} path={[item.name]} />
            ))}
        </div>
    );
};

export default FileExplorer;
