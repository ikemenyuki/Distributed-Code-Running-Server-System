class FileSystemEntity {
    constructor(name) {
        this.name = name;
    }

    serialize() {
        // Basic serialization that will be extended
        return { name: this.name };
    }
}

class File extends FileSystemEntity {
    constructor(name, content = "") {
        super(name);
        this.type = "file";
        this.content = content;
    }

    serialize() {
        return {
            ...super.serialize(),
            type: this.type,
            content: this.content
        };
    }

    setContent(content) {
        this.content = content;
    }
}

class Folder extends FileSystemEntity {
    constructor(name) {
        super(name);
        this.type = "folder";
        this.children = [];
    }

    add(child) {
        this.children.push(child);
    }

    serialize() {
        return {
            ...super.serialize(),
            type: this.type,
            children: this.children.map(child => child.serialize())
        };
    }

    find(path) {
        if (!path) {
            return null;
        }

        // Split the path into parts, removing empty entries (due to leading slashes)
        // console.log('path', path);
        // const parts = path.split('/').filter(part => part !== '');
        let current = this;

        for (const part of path) {
            // Find child with the matching name
            const found = current.children.find(child => child.name === part);
            if (!found) {
                return null;  // No matching entry found in the current folder
            }
            current = found;
        }

        return current;
    }
}

export {
    File,
    Folder
};