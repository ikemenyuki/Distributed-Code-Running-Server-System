
const BACKEND_URL = 'http://localhost:8085';

const execCode = async (userEmail, filename) => {
    const savePath = '/api/save';
    const response = await fetch(BACKEND_URL + savePath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userEmail: userEmail,
            name: filename,
        })
    });
    // get the response header
    const data = await response.json();
    return data;
}


const saveCode = async (userEmail, filename, body, language) => {
    const savePath = '/api/save';
    const response = await fetch(BACKEND_URL + savePath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: body,
            userEmail: userEmail,
            name: filename,
            type: language
        })

    });
    // get the response header
    const status = response.status;
    return status === 200 ? true : false;
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
    sendCodeToExec,
    saveCode,
    loadCode,
    createFile,
    deleteFile,
    renameFile,
    getFiles
};