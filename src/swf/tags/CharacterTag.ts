export abstract class CharacterTag
{
    private _className: string = '';
    private _characterId: number = -1;

    public get className(): string
    {
        return this._className;
    }

    public set className(value: string)
    {
        this._className = value;
    }

    public get characterId(): number
    {
        return this._characterId;
    }

    public set characterId(value: number)
    {
        this._characterId = value;
    }
}
