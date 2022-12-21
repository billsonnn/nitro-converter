import { PlaneVisualizationXML } from './PlaneVisualizationXML';

export class PlaneXML
{
    private readonly _id: string;
    private readonly _visualizations: PlaneVisualizationXML[];
    private readonly _animatedVisualization: PlaneVisualizationXML[];

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

            for (const visualization of xml.visualization) this._visualizations.push(new PlaneVisualizationXML(visualization));
        }

        if ((xml.animatedVisualization !== undefined) && Array.isArray(xml.animatedVisualization))
        {
            this._animatedVisualization = [];

            for (const visualization of xml.animatedVisualization) this._animatedVisualization.push(new PlaneVisualizationXML(visualization));
        }
    }

    public get id(): string
    {
        return this._id;
    }

    public get visualizations(): PlaneVisualizationXML[]
    {
        return this._visualizations;
    }

    public get animatedVisualization(): PlaneVisualizationXML[]
    {
        return this._animatedVisualization;
    }
}
