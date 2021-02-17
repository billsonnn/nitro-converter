export class DimensionsXML
{
    private readonly _x: number;
    private readonly _y: number;
    private readonly _z: number;

    constructor(xml: any)
    {
        const attributes = xml.$;

        if(attributes !== undefined)
        {
            if(attributes.x !== undefined) this._x = parseInt(attributes.x);
            if(attributes.y !== undefined) this._y = parseInt(attributes.y);
            if(attributes.z !== undefined) this._z = parseInt(attributes.z);
        }
    }

    public get x(): number
    {
        return this._x;
    }

    public get y(): number
    {
        return this._y;
    }

    public get z(): number
    {
        return this._z;
    }
}
