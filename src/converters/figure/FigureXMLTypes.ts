export class FigureXMLManifest {
    private readonly _library: FigureXMLLibrary;

    constructor(manifestXML: any) {
        this._library = new FigureXMLLibrary(manifestXML.library[0]);
    }

    get library(): FigureXMLLibrary {
        return this._library;
    }
}

export class FigureXMLLibrary {

    private readonly _assets: FigureXMLAsset[];

    constructor(libraryXML: any) {
        this._assets = [];
        for (const assetObj of libraryXML.assets) {
            for (const asset of assetObj.asset) {
                this._assets.push(new FigureXMLAsset(asset));
            }
        }
    }

    get assets(): FigureXMLAsset[] {
        return this._assets;
    }
}

export class FigureXMLAsset {
    private readonly _name: string;
    private readonly _param: FigureXMLParam;

    constructor(assetXML: any) {
        this._name = assetXML.$.name;
        this._param = new FigureXMLParam(assetXML.param[0]);
    }

    get name(): string {
        return this._name;
    }

    get param(): FigureXMLParam {
        return this._param;
    }
}

export class FigureXMLParam {
    private readonly _value: string;

    constructor(paramXML: any) {
        this._value = paramXML.$.value;
    }

    get value(): string {
        return this._value;
    }
}