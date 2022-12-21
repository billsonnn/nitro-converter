import { PlaneMaterialCellColumnXML } from './PlaneMaterialCellColumnXML';

export class PlaneMaterialCellMatrixXML
{
    private readonly _repeatMode: string;
    private readonly _align: string;
    private readonly _normalMinX: number;
    private readonly _normalMaxX: number;
    private readonly _normalMinY: number;
    private readonly _normalMaxY: number;
    private readonly _columns: PlaneMaterialCellColumnXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.repeatMode !== undefined) this._repeatMode = attributes.repeatMode;
            if (attributes.align !== undefined) this._align = attributes.align;
            if (attributes.normalMinX !== undefined) this._normalMinX = parseFloat(attributes.normalMinX);
            if (attributes.normalMaxX !== undefined) this._normalMaxX = parseFloat(attributes.normalMaxX);
            if (attributes.normalMinY !== undefined) this._normalMinY = parseFloat(attributes.normalMinY);
            if (attributes.normalMaxY !== undefined) this._normalMaxY = parseFloat(attributes.normalMaxY);
        }

        if ((xml.materialCellColumn !== undefined) && Array.isArray(xml.materialCellColumn))
        {
            this._columns = [];

            for (const column of xml.materialCellColumn) this._columns.push(new PlaneMaterialCellColumnXML(column));
        }
    }

    public get repeatMode(): string
    {
        return this._repeatMode;
    }

    public get align(): string
    {
        return this._align;
    }

    public get normalMinX(): number
    {
        return this._normalMinX;
    }

    public get normalMaxX(): number
    {
        return this._normalMaxX;
    }

    public get normalMinY(): number
    {
        return this._normalMinY;
    }

    public get normalMaxY(): number
    {
        return this._normalMaxY;
    }

    public get columns(): PlaneMaterialCellColumnXML[]
    {
        return this._columns;
    }
}
