import { RoomPlaneMaskXML } from './RoomPlaneMaskXML';

export class PlaneMaskVisualizationDataXML
{
    private readonly _masks: RoomPlaneMaskXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if ((xml.mask !== undefined) && Array.isArray(xml.mask))
        {
            this._masks = [];

            for (const mask of xml.mask) this._masks.push(new RoomPlaneMaskXML(mask));
        }
    }

    public get masks(): RoomPlaneMaskXML[]
    {
        return this._masks;
    }
}
