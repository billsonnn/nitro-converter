export class PlaneLayerXML
{
    private readonly _materialId: string;
    private readonly _color: number;
    private readonly _offset: number;
    private readonly _align: string;

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.materialId !== undefined) this._materialId = attributes.materialId;
            if (attributes.color !== undefined) this._color = parseInt(attributes.color, 16);
            if (attributes.offset !== undefined) this._offset = parseInt(attributes.offset);
            if (attributes.align !== undefined) this._align = attributes.align;
        }
    }

    public get materialId(): string
    {
        return this._materialId;
    }

    public get color(): number
    {
        return this._color;
    }

    public get offset(): number
    {
        return this._offset;
    }

    public get align(): string
    {
        return this._align;
    }
}
