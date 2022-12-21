import { PlaneAnimationLayerItemXML } from './PlaneAnimationLayerItemXML';

export class PlaneAnimationLayerXML
{
    private readonly _items: PlaneAnimationLayerItemXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if ((xml.animationItem !== undefined) && Array.isArray(xml.animationItem))
        {
            this._items = [];

            for (const item of xml.animationItem) this._items.push(new PlaneAnimationLayerItemXML(item));
        }
    }

    public get items(): PlaneAnimationLayerItemXML[]
    {
        return this._items;
    }
}
