import { PlaneTextureBitmapXML } from './texture';

export class PlaneMaskVisualizationXML
{
    private readonly _size: number;
    private readonly _bitmaps: PlaneTextureBitmapXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.size !== undefined) this._size = parseInt(attributes.size);
        }

        if ((xml.bitmap !== undefined) && Array.isArray(xml.bitmap))
        {
            this._bitmaps = [];

            for (const bitmap of xml.bitmap) this._bitmaps.push(new PlaneTextureBitmapXML(bitmap));
        }
    }

    public get size(): number
    {
        return this._size;
    }

    public get bitmaps(): PlaneTextureBitmapXML[]
    {
        return this._bitmaps;
    }
}
