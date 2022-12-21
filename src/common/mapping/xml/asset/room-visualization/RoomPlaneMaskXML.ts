import { PlaneMaskVisualizationXML } from './PlaneMaskVisualizationXML';

export class RoomPlaneMaskXML
{
    private readonly _id: string;
    private readonly _visualizations: PlaneMaskVisualizationXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.id !== undefined) this._id = attributes.id;
        }

        if ((xml.maskVisualization !== undefined) && Array.isArray(xml.maskVisualization))
        {
            this._visualizations = [];

            for (const visualization of xml.maskVisualization) this._visualizations.push(new PlaneMaskVisualizationXML(visualization));
        }
    }

    public get id(): string
    {
        return this._id;
    }

    public get visualizations(): PlaneMaskVisualizationXML[]
    {
        return this._visualizations;
    }
}
