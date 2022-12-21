import { PlaneMaterialCellExtraItemDataXML } from './PlaneMaterialCellExtraItemDataXML';

export class PlaneMaterialCellXML
{
    private readonly _textureId: string;
    private readonly _extraData: PlaneMaterialCellExtraItemDataXML;

    constructor(xml: any)
    {
        const attributes = xml.$;

        if (attributes !== undefined)
        {
            if (attributes.textureId !== undefined) this._textureId = attributes.textureId;
        }

        if ((xml.extraItemData !== undefined) && Array.isArray(xml.extraItemData)) this._extraData = new PlaneMaterialCellExtraItemDataXML(xml.extraItemData[0]);
    }

    public get textureId(): string
    {
        return this._textureId;
    }

    public get extraData(): PlaneMaterialCellExtraItemDataXML
    {
        return this._extraData;
    }
}
