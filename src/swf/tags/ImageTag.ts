import ITag from "./ITag";
import CharacterTag from "./CharacterTag";

export default class ImageTag extends CharacterTag implements ITag {

    private readonly _code: number;
    private readonly _characterID: number;
    private readonly _imgType: string;
    private readonly _imgData: Buffer;

    constructor(image: { code: number, characterID: number, imgType: string, imgData: Buffer }) {
        super();

        this._code = image.code;
        this._characterID = image.characterID;
        this._imgType = image.imgType;
        this._imgData = image.imgData;

        this.characterId = this._characterID;
    }

    get code(): number {
        return this._code;
    };

    get characterID(): number {
        return this._characterID;
    }

    get imgType(): string {
        return this._imgType;
    }

    get imgData(): Buffer {
        return this._imgData;
    }
}