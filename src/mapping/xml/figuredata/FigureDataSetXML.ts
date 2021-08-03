import { FigureDataPartXML } from './FigureDataPartXML';

export class FigureDataSetXML
{
    private _id: number;
    private _gender: string;
    private _club: boolean;
    private _colorable: boolean;
    private _selectable: boolean;
    private _preselectable: boolean;
    private _parts: FigureDataPartXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        this._id = ((attributes && parseInt(attributes.id)) || 0);
        this._gender = ((attributes && attributes.gender) || '');
        this._club = ((attributes && parseInt(attributes.club) === 1) || false);
        this._colorable = ((attributes && parseInt(attributes.colorable) === 1) || false);
        this._selectable = ((attributes && parseInt(attributes.selectable) === 1) || false);
        this._preselectable = ((attributes && parseInt(attributes.preselectable) === 1) || false);

        if(xml.part !== undefined)
        {
            if(Array.isArray(xml.part))
            {
                this._parts = [];

                for(const index in xml.part)
                {
                    const part = xml.part[index];

                    this._parts.push(new FigureDataPartXML(part));
                }
            }
        }
    }

    public get id(): number
    {
        return this._id;
    }

    public get gender(): string
    {
        return this._gender;
    }

    public get club(): boolean
    {
        return this._club;
    }

    public get colorable(): boolean
    {
        return this._colorable;
    }

    public get selectable(): boolean
    {
        return this._selectable;
    }

    public get preselectable(): boolean
    {
        return this._preselectable;
    }

    public get parts(): FigureDataPartXML[]
    {
        return this._parts;
    }
}
