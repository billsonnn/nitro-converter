import { ActionXML } from './ActionXML';
import { CreditsXML } from './CreditsXML';
import { MaskXML } from './MaskXML';
import { ModelXML } from './model/ModelXML';

export class LogicXML
{
    private readonly _type: string;
    private readonly _model: ModelXML;
    private readonly _action: ActionXML;
    private readonly _mask: MaskXML;
    private readonly _credits: CreditsXML;

    constructor(xml: any)
    {
        const attributes = xml.$;

        if(attributes !== undefined)
        {
            if(attributes.type !== undefined) this._type = attributes.type;
        }

        if(xml.model !== undefined)
        {
            if(xml.model[0] !== undefined) this._model = new ModelXML(xml.model[0]);
        }

        if(xml.action !== undefined)
        {
            if(xml.action[0] !== undefined) this._action = new ActionXML(xml.action[0]);
        }

        if(xml.mask !== undefined)
        {
            if(xml.mask[0] !== undefined) this._mask = new MaskXML(xml.mask[0]);
        }

        if(xml.credits !== undefined)
        {
            if(xml.credits[0] !== undefined) this._credits = new CreditsXML(xml.credits[0]);
        }
    }

    public get type(): string
    {
        return this._type;
    }

    public get model(): ModelXML
    {
        return this._model;
    }

    public get action(): ActionXML | undefined
    {
        return this._action;
    }

    public get mask(): MaskXML | undefined
    {
        return this._mask;
    }

    public get credits(): CreditsXML | undefined
    {
        return this._credits;
    }
}
