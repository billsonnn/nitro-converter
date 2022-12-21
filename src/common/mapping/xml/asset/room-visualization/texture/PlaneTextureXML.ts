import { PlaneTextureBitmapXML } from './PlaneTextureBitmapXML';

export class PlaneTextureXML
{
    private readonly _id: string;
    private readonly _bitmaps: PlaneTextureBitmapXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.id !== undefined) this._id = attributes.id;
        }

        if ((xml.bitmap !== undefined) && Array.isArray(xml.bitmap))
        {
            this._bitmaps = [];

            for (const bitmap of xml.bitmap) this._bitmaps.push(new PlaneTextureBitmapXML(bitmap));
        }
    }

    public get id(): string
    {
        return this._id;
    }

    public get bitmaps(): PlaneTextureBitmapXML[]
    {
        return this._bitmaps;
    }
}
