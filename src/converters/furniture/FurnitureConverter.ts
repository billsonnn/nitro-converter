import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { BundleProvider } from '../../common/bundle/BundleProvider';
import { SpriteBundle } from '../../common/bundle/SpriteBundle';
import { Configuration } from '../../common/config/Configuration';
import { SWFConverter } from '../../common/converters/SWFConverter';
import { IAssetData } from '../../mapping/json';
import { AssetMapper, IndexMapper, LogicMapper, VisualizationMapper } from '../../mapping/mappers';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import File from '../../utils/File';
import Logger from '../../utils/Logger';
import NitroBundle from '../../utils/NitroBundle';
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

        if(!outputFolder.isDirectory())
        {
            spinner.text = `Creating Folder: ${ outputFolder.path }`;

            spinner.render();

            outputFolder.mkdirs();
        }

        await this._furniDownloader.download(async (habboAssetSwf: HabboAssetSWF) =>
        {
            spinner.text = 'Parsing Furniture: ' + habboAssetSwf.getDocumentClass();

            spinner.render();

            try
            {
                const spriteBundle = await this._bundleProvider.generateSpriteSheet(habboAssetSwf);

                await this.fromHabboAsset(habboAssetSwf, outputFolder.path, 'furniture', spriteBundle);
            }

            catch (error)
            {
                console.log();
                console.error(error);
            }
        });

        spinner.succeed(`Furniture Finished in ${ Date.now() - now }ms`);
    }

    private async fromHabboAsset(habboAssetSWF: HabboAssetSWF, outputFolder: string, type: string, spriteBundle: SpriteBundle): Promise<void>
    {
        const assetData = await this.mapXML2JSON(habboAssetSWF, 'furniture');

        if(!assetData) return;

        const name = habboAssetSWF.getDocumentClass();
        const path = outputFolder + '/' + name + '.nitro';
        const nitroBundle = new NitroBundle();

        nitroBundle.addFile((name + '.json'), Buffer.from(JSON.stringify(assetData)));

        if(spriteBundle && (spriteBundle.spritesheet !== undefined))
        {
            if(spriteBundle.spritesheet && spriteBundle.imageData)
            {
                assetData.spritesheet = spriteBundle.spritesheet;

                nitroBundle.addFile(spriteBundle.imageData.name, spriteBundle.imageData.buffer);
            }
        }

        const buffer = await nitroBundle.toBufferAsync();

        await writeFile(path, buffer);
    }

    private async mapXML2JSON(habboAssetSWF: HabboAssetSWF, assetType: string): Promise<IAssetData>
    {
        if(!habboAssetSWF) return null;

        const assetData: IAssetData = {};

        assetData.type = assetType;

        try
        {
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

        catch (error)
        {
            console.log();
            console.error(error);
        }
    }
}
