const fs = require("fs");

export default class File {

    private readonly _path: string;

    constructor(path: string) {
        this._path = path;
    }

    public exists(): boolean {
        return fs.existsSync(this._path);
    }

    public mkdirs(): void {
        return fs.mkdirSync(this._path);
    }

    public list(): string[] {
        const test = fs.readdirSync(this._path);
        console.log(test);

        return test;
    }

    public isDirectory(): boolean {
        return this.exists() && fs.lstatSync(this._path).isDirectory()
    }

    get path(): string {
        return this._path;
    }
}