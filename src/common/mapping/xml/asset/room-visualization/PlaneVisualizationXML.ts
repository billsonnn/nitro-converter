import { PlaneXML } from './PlaneXML';

export class PlaneVisualizationXML
{
    private readonly _id: string;
    private readonly _visualizations: PlaneXML[];
    private readonly _animatedVisualization: PlaneXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.id !== undefined) this._id = attributes.id;
        }

        if ((xml.visualization !== undefined) && Array.isArray(xml.visualization))
        {
            this._visualizations = [];

            for (const visualization of xml.visualization) this._visualizations.push(new PlaneXML(visualization));
        }

        if ((xml.animatedVisualization !== undefined) && Array.isArray(xml.animatedVisualization))
        {
            this._animatedVisualization = [];

            for (const visualization of xml.animatedVisualization) this._animatedVisualization.push(new PlaneXML(visualization));
        }
    }

    public get id(): string
    {
        return this._id;
    }

    public get visualizations(): PlaneXML[]
    {
        return this._visualizations;
    }

    public get animatedVisualization(): PlaneXML[]
    {
        return this._animatedVisualization;
    }
}
