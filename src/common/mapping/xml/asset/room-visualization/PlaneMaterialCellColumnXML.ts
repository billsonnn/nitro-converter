import { PlaneMaterialCellXML } from './PlaneMaterialCellXML';

export class PlaneMaterialCellColumnXML
{
    private readonly _repeatMode: string;
    private readonly _width: number;
    private readonly _cells: PlaneMaterialCellXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.repeatMode !== undefined) this._repeatMode = attributes.repeatMode;
            if (attributes.width !== undefined) this._width = parseInt(attributes.width);
        }

        if ((xml.materialCell !== undefined) && Array.isArray(xml.materialCell))
        {
            this._cells = [];

            for (const cell of xml.materialCell) this._cells.push(new PlaneMaterialCellXML(cell));
        }
    }

    public get repeatMode(): string
    {
        return this._repeatMode;
    }

    public get width(): number
    {
        return this._width;
    }

    public get cells(): PlaneMaterialCellXML[]
    {
        return this._cells;
    }
}
