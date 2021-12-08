import { existsSync, lstatSync, mkdirSync, readdirSync, RmOptions, rmSync } from 'fs';

export class File
{
    private readonly _path: string;

    constructor(path: string)
    {
        this._path = path;
    }

    public exists(): boolean
    {
        return existsSync(this._path);
    }

    public mkdirs(): void
    {
        return mkdirSync(this._path);
    }

    public list(): string[]
    {
        const test = readdirSync(this._path);

        return test;
    }

    public isDirectory(): boolean
    {
        return this.exists() && lstatSync(this._path).isDirectory();
    }

    public rmdir(options: RmOptions): void
    {
        return rmSync(this._path, options);
    }

    public get path(): string
    {
        return this._path;
    }
}
