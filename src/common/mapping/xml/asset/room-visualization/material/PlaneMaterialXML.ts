import { PlaneMaterialCellMatrixXML } from './PlaneMaterialCellMatrixXML';

export class PlaneMaterialXML
{
    private readonly _id: string;
    private readonly _matrices: PlaneMaterialCellMatrixXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.id !== undefined) this._id = attributes.id;
        }

        if ((xml.materialCellMatrix !== undefined) && Array.isArray(xml.materialCellMatrix))
        {
            this._matrices = [];

            for (const matrix of xml.materialCellMatrix) this._matrices.push(new PlaneMaterialCellMatrixXML(matrix));
        }
    }

    public get id(): string
    {
        return this._id;
    }

    public get matrices(): PlaneMaterialCellMatrixXML[]
    {
        return this._matrices;
    }
}
