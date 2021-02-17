import { FurnitureTypeXML } from './FurnitureTypeXML';

export class FurnitureDataXML
{
    private _floorItems: FurnitureTypeXML[];
    private _wallItems: FurnitureTypeXML[];

    constructor(xml: any)
    {
        if(!xml) return;

        if(xml.roomitemtypes !== undefined)
        {
            this._floorItems = [];

            for(const roomitemtype in xml.roomitemtypes)
            {
                const furniTypes = xml.roomitemtypes[roomitemtype];

                if(furniTypes !== undefined)
                {
                    for(const furniType in furniTypes) this._floorItems.push(new FurnitureTypeXML('floor', furniType));
                }
            }
        }

        if(xml.wallitemtypes !== undefined)
        {
            this._wallItems = [];

            for(const wallitemtype in xml.wallitemtypes)
            {
                const furniTypes = xml.wallitemtypes[wallitemtype];

                if(furniTypes !== undefined)
                {
                    for(const furniType in furniTypes) this._wallItems.push(new FurnitureTypeXML('wall', furniType));
                }
            }
        }
    }

    public get floorItems(): FurnitureTypeXML[]
    {
        return this._floorItems;
    }

    public get wallItems(): FurnitureTypeXML[]
    {
        return this._wallItems;
    }
}
