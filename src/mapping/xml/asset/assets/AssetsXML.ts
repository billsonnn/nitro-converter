import { AssetXML } from './AssetXML';
import { PaletteXML } from './PaletteXML';

export class AssetsXML
{
    private readonly _assets: AssetXML[];
    private readonly _palettes: PaletteXML[];

    constructor(xml: any)
    {
        if(xml.assets !== undefined)
        {
            this._assets = [];

            if(xml.assets.asset !== undefined) for(const asset of xml.assets.asset) this._assets.push(new AssetXML(asset));

            if(xml.assets.palette !== undefined)
            {
                this._palettes = [];

                for(const palette of xml.assets.palette) this._palettes.push(new PaletteXML(palette));
            }
        }
    }

    public get assets(): AssetXML[]
    {
        return this._assets;
    }

    public get palettes(): PaletteXML[]
    {
        return this._palettes;
    }
}
