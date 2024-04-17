
const BACKEND_URL = 'http://localhost:8085';

const saveCode = async (userEmail, command, content, language) => {
    const response = await fetch(BACKEND_URL + '/api/execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: content,
            userEmail: userEmail,
            command: command,
            language: language
        })

    });
    console.log(response);
    
    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    return data;
}

const loadCode = async (filename) => {
    const loadPath = '/notebook/' + filename + '/load';
    const response = await fetch(BACKEND_URL + loadPath, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

const createFile = async (filename) => {
    const createPath = '/notebook/' + filename + '/create';
    const response = await fetch(BACKEND_URL + createPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

const deleteFile = async (filename) => {
    const deletePath = '/notebook/' + filename + '/delete';
    const response = await fetch(BACKEND_URL + deletePath, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}

const renameFile = async (filename, newFilename) => {
    const renamePath = '/notebook/' + filename + '/rename';
    const response = await fetch(BACKEND_URL + renamePath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newFilename })
    });
    const data = await response.json();
    return data;
}

const getFiles = async () => {
    const filesPath = '/api/getAllFiles';
    try {
        const response = await fetch(BACKEND_URL + filesPath, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching files:', error);
        throw error;
    }
}


// export apis
export {
    saveCode,
    // execCode,
    loadCode,
    createFile,
    deleteFile,
    renameFile,
    getFiles
};