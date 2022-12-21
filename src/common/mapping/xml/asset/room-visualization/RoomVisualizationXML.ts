import { PlaneMaskVisualizationDataXML } from './PlaneMaskVisualizationDataXML';
import { PlaneVisualizationDataXML } from './PlaneVisualizationDataXML';

export class RoomVisualizationXML
{
    private readonly _wallData: PlaneVisualizationDataXML;
    private readonly _floorData: PlaneVisualizationDataXML;
    private readonly _landscapeData: PlaneVisualizationDataXML;
    private readonly _maskData: PlaneMaskVisualizationDataXML;

    constructor(xml: any)
    {
        const attributes = xml.$;

        if ((xml.wallData !== undefined) && Array.isArray(xml.wallData))
        {
            this._wallData = new PlaneVisualizationDataXML(xml.wallData[0]);
        }

        if ((xml.floorData !== undefined) && Array.isArray(xml.floorData))
        {
            this._floorData = new PlaneVisualizationDataXML(xml.floorData[0]);
        }

        if ((xml.landscapeData !== undefined) && Array.isArray(xml.landscapeData))
        {
            this._landscapeData = new PlaneVisualizationDataXML(xml.landscapeData[0]);
        }

        if ((xml.maskData !== undefined) && Array.isArray(xml.maskData))
        {
            this._maskData = new PlaneMaskVisualizationDataXML(xml.maskData[0]);
        }
    }

    public get wallData(): PlaneVisualizationDataXML
    {
        return this._wallData;
    }

    public get floorData(): PlaneVisualizationDataXML
    {
        return this._floorData;
    }

    public get landscapeData(): PlaneVisualizationDataXML
    {
        return this._landscapeData;
    }

    public get maskData(): PlaneMaskVisualizationDataXML
    {
        return this._maskData;
    }
}
