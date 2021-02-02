export class ManifestXML {
    private readonly _library: LibraryXML;

    constructor(manifestXML: any) {
        this._library = new LibraryXML(manifestXML.manifest.library[0]);
    }

    get library(): LibraryXML {
        return this._library;
    }
}

export class LibraryXML {
    private readonly _name: string;
    private readonly _version: string;

    private readonly _assets: Array<AssetXML>;
    private readonly _aliases: Array<AliasXML>;

    constructor(libraryXML: any) {
        const attributes = libraryXML.$;
        this._name = attributes.id;
        this._version = attributes.version;

        this._assets = new Array<AssetXML>();
        if (libraryXML.assets !== undefined) {
            for (const assetParent of libraryXML.assets) {
                for (const asset of assetParent.asset) {
                    this._assets.push(new AssetXML(asset));
                }
            }
        }

        this._aliases = new Array<AliasXML>();
        if (libraryXML.aliases !== undefined && Array.isArray(libraryXML.aliases)) {
            for (const aliasParent of libraryXML.aliases) {
                if (Array.isArray(aliasParent.alias)) {
                    for (const alias of aliasParent.alias) {
                        this._aliases.push(new AliasXML(alias));
                    }
                }
            }
        }
    }

    get name(): string {
        return this._name;
    }

    get version(): string {
        return this._version;
    }

    get assets(): Array<AssetXML> {
        return this._assets;
    }

    get aliases(): Array<AliasXML> {
        return this._aliases;
    }
}

export class AliasXML {
    private readonly _name: string;
    private readonly _link: string;
    private readonly _fliph: number;
    private readonly _flipv: number;

    constructor(aliasXML: any) {
        const attributes = aliasXML.$;

        this._name = attributes.name;
        this._link = attributes.link;
        this._fliph = attributes.fliph;
        this._flipv = attributes.flipv;
    }

    get name(): string {
        return this._name;
    }

    get link(): string {
        return this._link;
    }

    get fliph(): number {
        return this._fliph;
    }

    get flipv(): number {
        return this._flipv;
    }
}

export class AssetXML {
    private readonly _name: string;
    private readonly _mimeType: string;
    private readonly _param: ParamXML | undefined;

    constructor(assetXML: any) {
        const attributes = assetXML.$;
        this._name = attributes.name;
        this._mimeType = attributes.mimeType;

        if (assetXML.param !== undefined) {
            for (const param of assetXML.param) {
                this._param = new ParamXML(param);
            }
        }
    }

    get name(): string {
        return this._name;
    }

    get mimeType(): string {
        return this._mimeType;
    }

    get param(): ParamXML | undefined {
        return this._param;
    }
}

export class ParamXML {
    private readonly _key: string;
    private readonly _value: string;

    constructor(paramXML: any) {
        const attributes = paramXML.$;
        this._key = attributes.key;
        this._value = attributes.value;
    }

    get key(): string {
        return this._key;
    }

    get value(): string {
        return this._value;
    }
}