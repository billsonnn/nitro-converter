import { BundleProvider } from '../../../common/bundle/BundleProvider';
import { IAsset, IAssetData, IAssetPalette } from '../../json';
import { AssetsXML, AssetXML, PaletteXML } from '../../xml';
import { Mapper } from './Mapper';

export class AssetMapper extends Mapper
{
    public static mapXML(assets: any, output: IAssetData): void
    {
        if(!assets || !output) return;

        AssetMapper.mapAssetsXML(new AssetsXML(assets), output);
    }

    private static mapAssetsXML(xml: AssetsXML, output: IAssetData): void
    {
        if(!xml) return;

        if(xml.assets !== undefined)
        {
            output.assets = {};

            AssetMapper.mapAssetsAssetXML(xml.assets, output.assets);
        }

        if(xml.palettes !== undefined)
        {
            output.palettes = {};

            AssetMapper.mapAssetsPaletteXML(xml.palettes, output.palettes);
        }
    }

    private static mapAssetsAssetXML(xml: AssetXML[], output: { [index: string]: IAsset }): void
    {
        if(!xml || !xml.length) return;

        for(const assetXML of xml)
        {
            const asset: IAsset = {};

            if(assetXML.name !== undefined)
            {
                let isProhibited = false;
                
                for(const size of AssetMapper.PROHIBITED_SIZES)
                {
                    if(assetXML.name.indexOf(('_' + size + '_')) >= 0)
                    {
                        isProhibited = true;

                        break;
                    }
                }

                if(isProhibited) continue;
            }

            if(assetXML.source !== undefined)
            {
                asset.source = assetXML.source;

                if(BundleProvider.imageSource.has(assetXML.source))
                {
                    asset.source = BundleProvider.imageSource.get(assetXML.source) as string;
                }
            }

            if(assetXML.name !== undefined)
            {
                if(BundleProvider.imageSource.has(assetXML.name))
                {
                    asset.source = BundleProvider.imageSource.get(assetXML.name) as string;
                }
            }
            
            if(assetXML.x !== undefined) asset.x = assetXML.x;
            if(assetXML.y !== undefined) asset.y = assetXML.y;
            if(assetXML.flipH !== undefined) asset.flipH = assetXML.flipH;
            if(assetXML.flipV !== undefined) asset.flipV = assetXML.flipV;

            output[assetXML.name] = asset;
        }
    }

    private static mapAssetsPaletteXML(xml: PaletteXML[], output: { [index: string]: IAssetPalette }): void
    {
        if(!xml || !xml.length) return;

        for(const paletteXML of xml)
        {
            const palette: IAssetPalette = {};

            if(paletteXML.id !== undefined) palette.id = paletteXML.id;
            if(paletteXML.source !== undefined) palette.source = paletteXML.source;
            if(paletteXML.color1 !== undefined) palette.color1 = paletteXML.color1;
            if(paletteXML.color2 !== undefined) palette.color2 = paletteXML.color2;

            output[paletteXML.id.toString()] = palette;
        }
    }
}
