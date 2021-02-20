import { EffectLibraryPartXML } from './EffectLibraryPartXML';

export class EffectLibraryXML
{
    private _id: string;
    private _revision: number;
    private _parts: EffectLibraryPartXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if(attributes)
        {
            if(attributes.id !== undefined) this._id = attributes.id;
            if(attributes.revision !== undefined) this._revision = parseInt(attributes.revision);
        }

        if(xml.part !== undefined)
        {
            this._parts = [];

            for(const partId in xml.part)
            {
                const part = xml.part[partId];

                this._parts.push(new EffectLibraryPartXML(part));
            }
        }
    }

    public get id(): string
    {
        return this._id;
    }

    public get revision(): number
    {
        return this._revision;
    }

    public get parts(): EffectLibraryPartXML[]
    {
        return this._parts;
    }
}
