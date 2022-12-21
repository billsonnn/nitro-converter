export class PlaneVisualizationAnimatedLayerItemXML
{
    private readonly _id: number;
    private readonly _assetId: string;
    private readonly _x: string;
    private readonly _y: string;
    private readonly _randomX: string;
    private readonly _randomY: string;
    private readonly _speedX: number;
    private readonly _speedY: number;

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.id !== undefined) this._id = parseInt(attributes.id);
            if (attributes.assetId !== undefined) this._assetId = attributes.assetId;
            if (attributes.x !== undefined) this._x = attributes.x;
            if (attributes.y !== undefined) this._y = attributes.y;
            if (attributes.randomX !== undefined) this._randomX = attributes.randomX;
            if (attributes.randomY !== undefined) this._randomY = attributes.randomY;
            if (attributes.speedX !== undefined) this._speedX = parseFloat(attributes.speedX);
            if (attributes.speedY !== undefined) this._speedY = parseFloat(attributes.speedY);
        }
    }

    public get id(): number
    {
        return this._id;
    }

    public get assetId(): string
    {
        return this._assetId;
    }

    public get x(): string
    {
        return this._x;
    }

    public get y(): string
    {
        return this._y;
    }

    public get randomX(): string
    {
        return this._randomX;
    }

    public get randomY(): string
    {
        return this._randomY;
    }

    public get speedX(): number
    {
        return this._speedX;
    }

    public get speedY(): number
    {
        return this._speedY;
    }
}
