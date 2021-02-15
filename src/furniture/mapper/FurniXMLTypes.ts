export class AssetsXML {
    private readonly _assets: Array<AssetXML>;

    constructor(assetsXML: any) {
        this._assets = new Array<AssetXML>();

        for (const asset of assetsXML.assets.asset) {
            this._assets.push(new AssetXML(asset));
        }
    }

    get assets(): Array<AssetXML> {
        return this._assets;
    }
}

export class AssetXML {
    private readonly _name: string;
    private readonly _source: string | undefined;
    private readonly _x: number;
    private readonly _y: number;
    private readonly _flipH: boolean | undefined;
    private readonly _usesPalette: number | undefined;

    constructor(asset: any) {
        const attributes = asset.$;

        this._name = attributes.name;

        if (attributes.source !== undefined)
            this._source = attributes.source;

        this._x = attributes.x;

        this._y = attributes.y;

        if (attributes.flipH !== undefined)
            this._flipH = attributes.flipH === '1';

        if (attributes.usesPalette !== undefined)
            this._usesPalette = attributes.usesPalette;
    }

    get name(): string {
        return this._name;
    }

    get source(): string | undefined {
        return this._source;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get flipH(): boolean | undefined {
        return this._flipH;
    }

    get usesPalette(): number | undefined {
        return this._usesPalette;
    }
}

export class IndexXML {
    private readonly _type: string;
    private readonly _visualization: string;
    private readonly _logic: string;

    constructor(indexXML: any) {
        const attributes = indexXML.$;

        this._type = attributes.type;
        this._visualization = attributes.visualization;
        this._logic = attributes.logic;
    }

    get type(): string {
        return this._type;
    }

    get visualization(): string {
        return this._visualization;
    }

    get logic(): string {
        return this._logic;
    }
}

export class LogicXML {
    private readonly _type: string;
    private readonly _model: ModelXML;
    private readonly _action: ActionXML | undefined;
    private readonly _mask: MaskXML | undefined;
    private readonly _credits: CreditsXML | undefined;

    constructor(logicXML: any) {
        const attributes = logicXML.$;
        this._type = attributes.type;

        this._model = new ModelXML(logicXML.model[0]);
        if (logicXML.action !== undefined)
            this._action = new ActionXML(logicXML.action[0]);

        if (logicXML.mask !== undefined)
            this._mask = new MaskXML(logicXML.mask[0]);

        if (logicXML.credits !== undefined)
            this._credits = new CreditsXML(logicXML.credits[0]);
    }

    get type(): string {
        return this._type;
    }

    get model(): ModelXML {
        return this._model;
    }

    get action(): ActionXML | undefined {
        return this._action;
    }

    get mask(): MaskXML | undefined {
        return this._mask;
    }

    get credits(): CreditsXML | undefined {
        return this._credits;
    }
}

export class ModelXML {
    private readonly _dimensions: DimensionsXML;
    private readonly _directions: Array<DirectionXML>;

    constructor(modelXML: any) {
        this._dimensions = new DimensionsXML(modelXML.dimensions[0]);
        this._directions = new Array<DirectionXML>();

        if (Array.isArray(modelXML.directions)) {
            for (const directionParent of modelXML.directions) {
                if (Array.isArray(directionParent.direction)) {
                    for (const direction of directionParent.direction) {
                        this._directions.push(new DirectionXML(direction.$));
                    }
                } else {
                    console.log(directionParent.direction);
                }
            }
        }
    }

    get dimensions(): DimensionsXML {
        return this._dimensions;
    }

    get directions(): Array<DirectionXML> {
        return this._directions;
    }
}

export class DimensionsXML {
    private readonly _x: number;
    private readonly _y: number;
    private readonly _z: number;

    constructor(dimensionsXML: any) {
        const attributes = dimensionsXML.$;

        this._x = attributes.x;
        this._y = attributes.y;
        this._z = attributes.z;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get z(): number {
        return this._z;
    }
}

export class DirectionXML {
    private readonly _id: number;

    constructor(directionXML: any) {
        this._id = directionXML.id;
    }

    get id(): number {
        return this._id;
    }
}

export class ActionXML {
    private readonly _link: string;
    private readonly _startState: number;

    constructor(actionXML: any) {
        const attributes = actionXML.$;
        this._link = attributes.link;
        this._startState = attributes.startState;
    }

    get link(): string {
        return this._link;
    }

    get startState(): number {
        return this._startState;
    }
}

export class MaskXML {
    private readonly _type: string;

    constructor(maskXML: any) {
        this._type = maskXML.$.type;
    }

    get type(): string {
        return this._type;
    }
}

export class CreditsXML {
    private readonly _value: string;

    constructor(creditsXML: any) {
        this._value = creditsXML.$.value;
    }

    get value(): string {
        return this._value;
    }
}