import { CharacterTag } from './CharacterTag';
import { ITag } from './ITag';

export class ImageTag extends CharacterTag implements ITag
{
    private readonly _code: number;
    private readonly _characterID: number;
    private readonly _imgType: string;
    private readonly _imgData: Buffer;

    private readonly _bitmapWidth: number;
    private readonly _bitmapHeight: number;

    constructor(image: { code: number, characterID: number, imgType: string, imgData: Buffer, bitmapWidth: number, bitmapHeight: number })
    {
        super();

        this._code = image.code;
        this._characterID = image.characterID;
        this._imgType = image.imgType;
        this._imgData = image.imgData;

        this.characterId = this._characterID;

        this._bitmapWidth = image.bitmapWidth;
        this._bitmapHeight = image.bitmapHeight;
    }

    public get code(): number
    {
        return this._code;
    }

    public get characterID(): number
    {
        return this._characterID;
    }

    public get imgType(): string
    {
        return this._imgType;
    }

    public get imgData(): Buffer
    {
        return this._imgData;
    }

    public get bitmapWidth(): number
    {
        return this._bitmapWidth;
    }

    public get bitmapHeight(): number
    {
        return this._bitmapHeight;
    }
}
