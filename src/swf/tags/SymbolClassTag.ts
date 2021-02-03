import ITag from "./ITag";

export interface SymbolClass {
    id: number,
    name: string
}

export default class SymbolClassTag implements ITag {

    private readonly _tags: Array<number>;
    private readonly _names: Array<string>;

    constructor(tags: Array<SymbolClass>) {
        this._tags = [];
        this._names = [];

        for (const symbolClass of tags) {
            this._tags.push(symbolClass.id);
            this._names.push(symbolClass.name);
        }
    }

    get tags(): Array<number> {
        return this._tags;
    }

    get names(): Array<string> {
        return this._names;
    }

    get code(): number {
        return 76;
    }
}