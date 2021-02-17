import { DimensionsXML } from './DimensionsXML';
import { ModelDirectionXML } from './ModelDirectionXML';

export class ModelXML
{
    private readonly _dimensions: DimensionsXML;
    private readonly _directions: ModelDirectionXML[];

    constructor(xml: any)
    {
        if(xml.dimensions !== undefined)
        {
            if(xml.dimensions[0] !== undefined) this._dimensions = new DimensionsXML(xml.dimensions[0]);
        }

        if(xml.directions !== undefined)
        {
            this._directions = [];

            if(Array.isArray(xml.directions))
            {
                for(const directionParent of xml.directions)
                {
                    if(Array.isArray(directionParent.direction)) for(const direction of directionParent.direction) this._directions.push(new ModelDirectionXML(direction.$));
                }
            }
        }
    }

    public get dimensions(): DimensionsXML
    {
        return this._dimensions;
    }

    public get directions(): ModelDirectionXML[]
    {
        return this._directions;
    }
}
