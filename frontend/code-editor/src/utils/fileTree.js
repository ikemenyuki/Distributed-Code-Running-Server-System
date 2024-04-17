class FileSystemEntity {
    constructor(name) {
        this.name = name;
    }

    serialize() {
        // Basic serialization that will be extended
        return { name: this.name };
    }

    clone() {
        return new FileSystemEntity(this.name);
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

    clone() {
        // Create a new File instance with the same content
        return new File(this.name, this.content);
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
        let current = this;
        for (const part of path) {
            const found = current.children.find(child => child.name === part);
            if (!found) {
                return null; // No matching entry found in the current folder
            }
            current = found;
        }
        return current;
    }

    clone() {
        // Create a new Folder instance and clone each child into it
        const newFolder = new Folder(this.name);
        this.children.forEach(child => {
            newFolder.add(child.clone());
        });
        return newFolder;
    }
}

export {
    File,
    Folder
};
