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
import { PetDownloader } from './PetDownloader';

@singleton()
export class PetConverter extends SWFConverter
{
    constructor(
        private readonly _petDownloader: PetDownloader,
        private readonly _config: Configuration,
        private readonly _bundleProvider: BundleProvider,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(): Promise<void>
    {
        const now = Date.now();

        const spinner = ora('Preparing Pets').start();

        const outputFolder = new File(this._config.getValue('output.folder.pet'));

        if(!outputFolder.isDirectory())
        {
            spinner.text = `Creating Folder: ${ outputFolder.path }`;

            spinner.render();

            outputFolder.mkdirs();
        }

        await this._petDownloader.download(async (habboAssetSwf: HabboAssetSWF) =>
        {
            spinner.text = 'Parsing Pet: ' + habboAssetSwf.getDocumentClass();

            spinner.render();

            try
            {
                const spriteBundle = await this._bundleProvider.generateSpriteSheet(habboAssetSwf);

                await this.fromHabboAsset(habboAssetSwf, outputFolder.path, 'pet', spriteBundle);
            }

            catch (error)
            {
                console.log();
                console.error(error);
            }
        });

        spinner.succeed(`Pets Finished in ${ Date.now() - now }ms`);
    }

    private async fromHabboAsset(habboAssetSWF: HabboAssetSWF, outputFolder: string, type: string, spriteBundle: SpriteBundle): Promise<void>
    {
        try
        {
            const assetData = await this.mapXML2JSON(habboAssetSWF, 'pet');

            if(!assetData) return;

            if(spriteBundle && (spriteBundle.spritesheet !== undefined)) assetData.spritesheet = spriteBundle.spritesheet;

            const name = habboAssetSWF.getDocumentClass();
            const path = outputFolder + '/' + name + '.nitro';
            const nitroBundle = new NitroBundle();

            nitroBundle.addFile((name + '.json'), Buffer.from(JSON.stringify(assetData)));

            if(spriteBundle.imageData !== undefined)
            {
                nitroBundle.addFile(spriteBundle.imageData.name, spriteBundle.imageData.buffer);
            }

            const buffer = await nitroBundle.toBufferAsync();

            await writeFile(path, buffer);
        }

        catch (err)
        {
            this._logger.logErrorAsync(err);
        }
    }

    private async mapXML2JSON(habboAssetSWF: HabboAssetSWF, assetType: string): Promise<IAssetData>
    {
        if(!habboAssetSWF) return null;

        const assetData: IAssetData = {};

        assetData.type = assetType;

        try
        {
            const indexXML = await PetConverter.getIndexXML(habboAssetSWF);

            if(indexXML) IndexMapper.mapXML(indexXML, assetData);

            const assetXML = await PetConverter.getAssetsXML(habboAssetSWF);

            if(assetXML)
            {
                AssetMapper.mapXML(assetXML, assetData);

                if(assetData.palettes !== undefined)
                {
                    for(const paletteId in assetData.palettes)
                    {
                        const palette = assetData.palettes[paletteId];

                        const paletteColors = PetConverter.getPalette(habboAssetSWF, palette.source);

                        if(!paletteColors)
                        {
                            delete assetData.palettes[paletteId];

                            continue;
                        }

                        const rgbs: [ number, number, number ][] = [];

                        for(const rgb of paletteColors) rgbs.push([ rgb[0], rgb[1], rgb[2] ]);

                        palette.rgb = rgbs;
                    }
                }
            }

            const logicXML = await PetConverter.getLogicXML(habboAssetSWF);

            if(logicXML) LogicMapper.mapXML(logicXML, assetData);

            const visualizationXML = await PetConverter.getVisualizationXML(habboAssetSWF);

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
