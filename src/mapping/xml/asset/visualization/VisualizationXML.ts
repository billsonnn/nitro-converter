import { VisualizationDataXML } from './VisualizationDataXML';

export class VisualizationXML
{
    private readonly _type: string;
    private readonly _visualizations: VisualizationDataXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if(attributes !== undefined)
        {
            if(attributes.type !== undefined) this._type = attributes.type;
        }

        if(xml.graphics !== undefined)
        {
            this._visualizations = [];

            if(Array.isArray(xml.graphics))
            {
                for(const graphic of xml.graphics) for(const visualization of graphic.visualization) this._visualizations.push(new VisualizationDataXML(visualization));
            }
        }
    }

    public get type(): string
    {
        return this._type;
    }

    public get visualizations(): VisualizationDataXML[]
    {
        return this._visualizations;
    }
}
