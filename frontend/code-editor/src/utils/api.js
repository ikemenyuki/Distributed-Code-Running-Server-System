const BACKEND_URL = 'http://34.70.178.243:80';
const LLM_URL = 'http://35.226.42.92:80';

const saveCode = async (userEmail, command, content, language) => {
    const response = await fetch(BACKEND_URL + '/api/execute', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content: content,
            userEmail: userEmail,
            command: ["cd ./root && " + command],
            language: language
        })

    });
    console.log(`[saveCode] response: ${response}`);

    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    return data;
}

const askAi = async (code, command, errorMessage) => {
    const response = await fetch(LLM_URL + '/ask-LLM', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: code,
            command: command,
            output: errorMessage
        })

    });
    console.log(`[askAi] response: ${response}`);

    if (!response.ok) {
        return null;
    }
    const data = await response.json();
    return data;
}

const chatAi = async (code, message) => {
    const response = await fetch(LLM_URL + '/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            code: code,
            message: message
        })

    });
    console.log(`[askAi] response: ${response}`);

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
    askAi,
    chatAi,
    loadCode,
    createFile,
    deleteFile,
    renameFile,
    getFiles
};