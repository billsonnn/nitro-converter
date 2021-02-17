export class PaletteXML
{
    private readonly _id: number;
    private readonly _source: string;
    private readonly _color1: string;
    private readonly _color2: string;

    constructor(xml: any)
    {
        const attributes = xml.$;

        if(attributes)
        {
            if(attributes.id !== undefined) this._id = parseInt(attributes.id);
            if(attributes.source !== undefined) this._source = attributes.source;
            if(attributes.color1 !== undefined) this._color1 = attributes.color1;
            if(attributes.color2 !== undefined) this._color2 = attributes.color2;
        }
    }

    public get id(): number
    {
        return this._id;
    }

    public get source(): string
    {
        return this._source;
    }

    public get color1(): string
    {
        return this._color1;
    }

    public get color2(): string
    {
        return this._color2;
    }
}
