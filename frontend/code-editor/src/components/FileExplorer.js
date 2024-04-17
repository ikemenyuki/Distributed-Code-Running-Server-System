import React, { useEffect, useState } from 'react';
import '../css/FileExplorer.css';

const FileExplorer = ({ fileRoot, onFileClick, onAddFileClick, onAddFolderClick }) => {
    const [fileStructure, setFileStructure] = useState([]);

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

    useEffect(() => {
        setFileStructure(fileRoot.children.map(child => child.serialize()));
        // console.log('File Structure:', fileStructure);
    }, [fileRoot]);

    const FileItem = ({ item, path = [] }) => {
        const [isOpen, setIsOpen] = useState(false);
        const isFolder = item.type === 'folder';

        const toggle = (e) => {
            if (isFolder) setIsOpen(!isOpen);
            else {
                e.stopPropagation();
                onFileClick(item.name, path);
            }
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
                    {item.name === 'root' ? '/' : item.name}
                    <div className="actions">
                        <i className="fa fa-plus" title="Add File" onClick={() => onAddFileClick(path)}></i>
                        <i className="fa fa-plus-square" style={{ marginLeft: 10 }} title="Add Folder" onClick={() => onAddFolderClick(path)}></i>
                        <i className="fa fa-trash" onClick={() => deleteItem(path)}></i>
                    </div>
                </div>
                {isOpen && isFolder && (
                    <div className="nested">
                        {item.children.sort(sortItems).map((child, index) => (
                            <FileItem key={index} item={child} path={[...path, child.name]} onFileClick={onFileClick} />
                        ))}
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="file-explorer">
            {fileStructure.sort(sortItems).map((item, index) => (
                <FileItem key={index} item={item} path={[item.name]} onFileClick={onFileClick} />
            ))}
        </div>
    );
};

export default FileExplorer;
