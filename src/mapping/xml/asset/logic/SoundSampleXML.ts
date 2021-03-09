export class SoundSampleXML
{
    private readonly _id: number;

    constructor(xml: any)
    {
        const attributes = xml[0].$;

        if(attributes !== undefined)
        {
            if(attributes.id !== undefined) this._id = parseInt(attributes.id);
        }
    }

    public get id(): number
    {
        return this._id;
    }
}
