import { BundleProvider } from '../../../common/bundle/BundleProvider';
import { IAsset, IAssetData } from '../../json';
import { ManifestLibraryAssetParamXML, ManifestLibraryAssetXML, ManifestLibraryXML, ManifestXML } from '../../xml';
import { Mapper } from './Mapper';

export class ManifestMapper extends Mapper
{
    public static mapXML(manifest: any, output: IAssetData): void
    {
        if(!manifest || !output) return;

        ManifestMapper.mapManifestXML(new ManifestXML(manifest.manifest), output);
    }

    private static mapManifestXML(xml: ManifestXML, output: IAssetData): void
    {
        if(!xml || !output) return;

        if(xml.library !== undefined) ManifestMapper.mapManifestLibraryXML(xml.library, output);
    }

    private static mapManifestLibraryXML(xml: ManifestLibraryXML, output: IAssetData): void
    {
        if(!xml || !output) return;

        if(xml.assets !== undefined)
        {
            if(xml.assets.length)
            {
                output.assets = {};

                ManifestMapper.mapManifestLibraryAssetXML(xml.assets, output.assets);
            }
        }
    }

    private static mapManifestLibraryAssetXML(xml: ManifestLibraryAssetXML[], output: { [index: string]: IAsset }): void
    {
        if(!xml || !xml.length || !output) return;

        for(const libraryAssetXML of xml)
        {
            const asset: IAsset = {};

            if(libraryAssetXML.name !== undefined)
            {
                if(libraryAssetXML.name.startsWith('sh_')) continue;

                if(libraryAssetXML.name.indexOf('_32_') >= 0) continue;

                if(libraryAssetXML.param !== undefined) ManifestMapper.mapManifestLibraryAssetParamXML(libraryAssetXML.param, asset);

                if(BundleProvider.imageSource.has(libraryAssetXML.name)) asset.source = BundleProvider.imageSource.get(libraryAssetXML.name);

                output[libraryAssetXML.name] = asset;
            }
        }
    }

    private static mapManifestLibraryAssetParamXML(xml: ManifestLibraryAssetParamXML, output: IAsset): void
    {
        if(!xml || !output) return;

        if(xml.value !== undefined)
        {
            const split = xml.value.split(',');

            output.x = parseInt(split[0]);
            output.y = parseInt(split[1]);
        }
    }
}
