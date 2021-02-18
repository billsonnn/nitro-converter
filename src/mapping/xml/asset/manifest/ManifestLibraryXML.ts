import { ManifestLibraryAssetXML } from './ManifestLibraryAssetXML';

export class ManifestLibraryXML
{
    private readonly _name: string;
    private readonly _version: string;
    private readonly _assets: ManifestLibraryAssetXML[];

    constructor(xml: any)
    {
        const attributes = xml.$;

        if(attributes !== undefined)
        {
            if(attributes.name !== undefined) this._name = attributes.name;
            if(attributes.version !== undefined) this._version = attributes.version;
        }

        if(xml.assets !== undefined)
        {
            if(Array.isArray(xml.assets))
            {
                this._assets = [];

                for(const assetPartParent of xml.assets)
                {
                    if(Array.isArray(assetPartParent.asset))
                    {
                        for(const asset of assetPartParent.asset) this._assets.push(new ManifestLibraryAssetXML(asset));
                    }
                }
            }
        }
    }

    public get assets(): ManifestLibraryAssetXML[]
    {
        return this._assets;
    }
}
