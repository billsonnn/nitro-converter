import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { BundleProvider } from '../../common/bundle/BundleProvider';
import { Configuration } from '../../common/config/Configuration';
import { SWFConverter } from '../../common/converters/SWFConverter';
import { IAssetData } from '../../mapping/json';
import { AssetMapper, IndexMapper, LogicMapper, VisualizationMapper } from '../../mapping/mappers';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import File from '../../utils/File';
import Logger from '../../utils/Logger';
import { FurnitureDownloader } from './FurnitureDownloader';

@singleton()
export class FurnitureConverter extends SWFConverter
{
    constructor(
        private readonly _furniDownloader: FurnitureDownloader,
        private readonly _configuration: Configuration,
        private readonly _bundleProvider: BundleProvider,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(): Promise<void>
    {
        const now = Date.now();

        const spinner = ora('Preparing Furniture').start();

        const outputFolder = new File(this._configuration.getValue('output.folder.furniture'));

        if(!outputFolder.isDirectory()) outputFolder.mkdirs();

        try
        {
            await this._furniDownloader.download(async (habboAssetSwf: HabboAssetSWF) =>
            {
                spinner.text = 'Parsing Furniture: ' + habboAssetSwf.getDocumentClass();

                spinner.render();

                const assetData = await this.mapXML2JSON(habboAssetSwf, 'furniture');
                const spriteBundle = await this._bundleProvider.generateSpriteSheet(habboAssetSwf);

                await this.fromHabboAsset(habboAssetSwf, outputFolder.path, 'furniture', assetData, spriteBundle);
            });

            spinner.succeed(`Furniture finished in ${ Date.now() - now }ms`);
        }

        catch (error)
        {
            spinner.fail('Furniture failed: ' + error.message);
        }
    }

    private async mapXML2JSON(habboAssetSWF: HabboAssetSWF, assetType: string): Promise<IAssetData>
    {
        if(!habboAssetSWF) return null;

        const assetData: IAssetData = {};

        assetData.type = assetType;

        const indexXML = await FurnitureConverter.getIndexXML(habboAssetSWF);

        if(indexXML) IndexMapper.mapXML(indexXML, assetData);

        const assetXML = await FurnitureConverter.getAssetsXML(habboAssetSWF);

        if(assetXML) AssetMapper.mapXML(assetXML, assetData);

        const logicXML = await FurnitureConverter.getLogicXML(habboAssetSWF);

        if(logicXML) LogicMapper.mapXML(logicXML, assetData);

        const visualizationXML = await FurnitureConverter.getVisualizationXML(habboAssetSWF);

        if(visualizationXML) VisualizationMapper.mapXML(visualizationXML, assetData);

        return assetData;
    }
}
