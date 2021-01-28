export default abstract class CharacterTag {
    private _className: string = "";
    private _characterId: number = -1;

    get className(): string {
        return this._className;
    }

    set className(value: string) {
        this._className = value;
    }

    get characterId(): number {
        return this._characterId;
    }

    set characterId(value: number) {
        this._characterId = value;
    }
}