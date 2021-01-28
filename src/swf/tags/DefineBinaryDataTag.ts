import {Tag} from "../HabboAssetSWF";
import ITag from "./ITag";
import CharacterTag from "./CharacterTag";

const {SWFBuffer} = require('swf-extract/swf-buffer');

export default class DefineBinaryDataTag extends CharacterTag implements ITag {

    private readonly _tag: number;
    private readonly _reserved: number;
    private readonly _binaryData: string;

    constructor(tag: Tag) {
        super();

        const swfBuffer = new SWFBuffer(tag.rawData);
        this._tag = swfBuffer.readUIntLE(16);
        this._reserved = swfBuffer.readUIntLE(32);
        const start = 6; //short 2 + int 4
        const end = tag.rawData.length;
        const binary = tag.rawData.slice(start, end);

        this._binaryData = binary.toString("utf-8");

        this.characterId = this._tag;
    }

    get code(): number {
        return 87;
    }

    get tag(): number {
        return this._tag;
    }

    get reserved(): number {
        return this._reserved;
    }

    get binaryData(): string {
        return this._binaryData;
    }
}