import {Tag} from "../HabboAssetSWF";
import ITag from "./ITag";

const {SWFBuffer} = require('swf-extract/swf-buffer');

export default class SymbolClassTag implements ITag {

    private readonly _tags: Array<number>;
    private readonly _names: Array<string>;

    constructor(tag: Tag) {
        this._tags = [];
        this._names = [];

        this.init(tag);
    }

    init(tag: Tag) {
        const swfBuffer = new SWFBuffer(tag.rawData);

        const numSymbols = swfBuffer.readUIntLE(16);
        for (let i = 0; i < numSymbols; i++) {
            const tagId = swfBuffer.readUIntLE(16);
            const tagName = swfBuffer.readString("utf-8");

            this._tags.push(tagId);
            this._names.push(tagName);
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