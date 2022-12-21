import { PlaneAnimationLayerXML } from './PlaneAnimationLayerXML';
import { PlaneLayerXML } from './PlaneLayerXML';

export class PlaneXML
{
    private readonly _size: number;
    private readonly _horizontalAngle: number;
    private readonly _verticalAngle: number;
    private readonly _layers: PlaneLayerXML[];
    private readonly _animatedLayers: PlaneAnimationLayerXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.size !== undefined) this._size = parseInt(attributes.size);
            if (attributes.horizontalAngle !== undefined) this._horizontalAngle = parseFloat(attributes.horizontalAngle);
            if (attributes.verticalAngle !== undefined) this._verticalAngle = parseFloat(attributes.verticalAngle);
        }

        if ((xml.visualizationLayer !== undefined) && Array.isArray(xml.visualizationLayer))
        {
            this._layers = [];

            for (const layer of xml.visualizationLayer) this._layers.push(new PlaneLayerXML(layer));
        }

        if ((xml.animationLayer !== undefined) && Array.isArray(xml.animationLayer))
        {
            this._animatedLayers = [];

            for (const layer of xml.animationLayer) this._animatedLayers.push(new PlaneAnimationLayerXML(layer));
        }
    }

    public get size(): number
    {
        return this._size;
    }

    public get horizontalAngle(): number
    {
        return this._horizontalAngle;
    }

    public get verticalAngle(): number
    {
        return this._verticalAngle;
    }

    public get layers(): PlaneLayerXML[]
    {
        return this._layers;
    }

    public get animatedLayers(): PlaneAnimationLayerXML[]
    {
        return this._animatedLayers;
    }
}
