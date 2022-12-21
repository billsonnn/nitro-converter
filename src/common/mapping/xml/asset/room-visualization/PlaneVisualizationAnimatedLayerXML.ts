import { PlaneVisualizationAnimatedLayerItemXML } from './PlaneVisualizationAnimatedLayerItemXML';

export class PlaneVisualizationAnimatedLayerXML
{
    private readonly _items: PlaneVisualizationAnimatedLayerItemXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if ((xml.animationItem !== undefined) && Array.isArray(xml.animationItem))
        {
            this._items = [];

            for (const item of xml.animationItem) this._items.push(new PlaneVisualizationAnimatedLayerItemXML(item));
        }
    }

    public get items(): PlaneVisualizationAnimatedLayerItemXML[]
    {
        return this._items;
    }
}
