import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { BundleProvider } from '../../common/bundle/BundleProvider';
import { Configuration } from '../../common/config/Configuration';
import { SWFConverter } from '../../common/converters/SWFConverter';
import { IAssetData } from '../../mapping/json';
import { AssetMapper, IndexMapper, LogicMapper, VisualizationMapper } from '../../mapping/mappers';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import File from '../../utils/File';
import { Logger } from '../../utils/Logger';
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
        if(!this._configuration.getBoolean('convert.furniture')) return;

        const now = Date.now();

        const spinner = ora('Preparing Furniture').start();

        const directory = this.getDirectory();

        try
        {
            await this._furniDownloader.download(directory, async (habboAssetSwf: HabboAssetSWF) =>
            {
                spinner.text = (`Parsing Furniture: ${ habboAssetSwf.getDocumentClass() } (${ this._furniDownloader.totalFinished } / ${ this._furniDownloader.totalItems })`);

                spinner.render();

                const spriteBundle = await this._bundleProvider.generateSpriteSheet(habboAssetSwf);
                const assetData = await this.mapXML2JSON(habboAssetSwf, 'furniture');

                await this.fromHabboAsset(habboAssetSwf, directory.path, 'furniture', assetData, spriteBundle);
            });

            spinner.succeed(`Furniture finished in ${ Date.now() - now }ms`);
        }

        catch (error)
        {
            spinner.fail('Furniture failed: ' + error.message);
        }
    }

    private getDirectory(): File
    {
        const baseFolder = new File(this._configuration.getValue('output.folder'));

        if(!baseFolder.isDirectory()) baseFolder.mkdirs();

        const gameDataFolder = new File(baseFolder.path + 'furniture');

        if(!gameDataFolder.isDirectory()) gameDataFolder.mkdirs();

        return gameDataFolder;
    }

    private async mapXML2JSON(habboAssetSWF: HabboAssetSWF, assetType: string): Promise<IAssetData>
    {
        if(!habboAssetSWF) return null;

        const output: IAssetData = {};

        output.type = assetType;

        const indexXML = await FurnitureConverter.getIndexXML(habboAssetSWF);

        if(indexXML) IndexMapper.mapXML(indexXML, output);

        const assetXML = await FurnitureConverter.getAssetsXML(habboAssetSWF);

        if(assetXML) AssetMapper.mapXML(assetXML, output);

        const logicXML = await FurnitureConverter.getLogicXML(habboAssetSWF);

        if(logicXML) LogicMapper.mapXML(logicXML, output);

        const visualizationXML = await FurnitureConverter.getVisualizationXML(habboAssetSWF);

        if(visualizationXML) VisualizationMapper.mapXML(visualizationXML, output);

        return output;
    }
}
