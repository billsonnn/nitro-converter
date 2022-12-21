export class PlaneTextureBitmapXML
{
    private readonly _assetName: string;
    private readonly _normalMinX: number;
    private readonly _normalMaxX: number;
    private readonly _normalMinY: number;
    private readonly _normalMaxY: number;

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.assetName !== undefined) this._assetName = attributes.assetName;
            if (attributes.normalMinX !== undefined) this._normalMinX = parseFloat(attributes.normalMinX);
            if (attributes.normalMaxX !== undefined) this._normalMaxX = parseFloat(attributes.normalMaxX);
            if (attributes.normalMinY !== undefined) this._normalMinY = parseFloat(attributes.normalMinY);
            if (attributes.normalMaxY !== undefined) this._normalMaxY = parseFloat(attributes.normalMaxY);
        }
    }

    public get assetName(): string
    {
        return this._assetName;
    }

    public get normalMinX(): number
    {
        return this._normalMinX;
    }

    public get normalMaxX(): number
    {
        return this._normalMaxX;
    }

    public get normalMinY(): number
    {
        return this._normalMinY;
    }

    public get normalMaxY(): number
    {
        return this._normalMaxY;
    }
}
