
export class PlaneMaterialCellExtraItemDataXML
{
    private readonly _limitMax: number;
    private readonly _extraItemTypes: string[];
    private readonly _offsets: [number, number][];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.limitMax !== undefined) this._limitMax = parseInt(attributes.limitMax);
        }

        if ((xml.extraItemTypes !== undefined) && Array.isArray(xml.extraItemTypes))
        {
            this._extraItemTypes = [];

            for (const item of xml.extraItemTypes)
            {
                if (item.extraItemType && Array.isArray(item.extraItemType))
                {
                    for (const itemType of item.extraItemType)
                    {
                        const attributes = itemType.$;

                        if (attributes !== undefined)
                        {
                            if (attributes.assetName !== undefined) this._extraItemTypes.push(attributes.assetName);
                        }
                    }
                }
            }
        }

        if ((xml.offsets !== undefined) && Array.isArray(xml.offsets))
        {
            this._offsets = [];

            for (const offset of xml.offsets)
            {
                if (offset.offset && Array.isArray(offset.offset))
                {
                    for (const child of offset.offset)
                    {
                        const attributes = child.$;

                        let x = 0;
                        let y = 0;

                        if (attributes !== undefined)
                        {
                            if (attributes.x !== undefined) x = parseInt(attributes.x);
                            if (attributes.y !== undefined) y = parseInt(attributes.y);
                        }

                        this._offsets.push([x, y]);
                    }
                }
            }
        }
    }

    public get limitMax(): number
    {
        return this._limitMax;
    }

    public get extraItemTypes(): string[]
    {
        return this._extraItemTypes;
    }

    public get offsets(): [number, number][]
    {
        return this._offsets;
    }
}
