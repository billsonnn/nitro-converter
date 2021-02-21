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
import { PetDownloader } from './PetDownloader';

@singleton()
export class PetConverter extends SWFConverter
{
    constructor(
        private readonly _petDownloader: PetDownloader,
        private readonly _configuration: Configuration,
        private readonly _bundleProvider: BundleProvider,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(): Promise<void>
    {
        const now = Date.now();

        const spinner = ora('Preparing Pets').start();

        const directory = this.getDirectory();

        try
        {
            await this._petDownloader.download(async (habboAssetSwf: HabboAssetSWF) =>
            {
                spinner.text = 'Parsing Pet: ' + habboAssetSwf.getDocumentClass();

                spinner.render();

                const spriteBundle = await this._bundleProvider.generateSpriteSheet(habboAssetSwf);
                const assetData = await this.mapXML2JSON(habboAssetSwf, 'pet');

                await this.fromHabboAsset(habboAssetSwf, directory.path, 'pet', assetData, spriteBundle);
            });

            spinner.succeed(`Pets finished in ${ Date.now() - now }ms`);
        }

        catch (error)
        {
            spinner.fail('Pet failed: ' + error.message);
        }
    }

    private getDirectory(): File
    {
        const baseFolder = new File(this._configuration.getValue('output.folder'));

        if(!baseFolder.isDirectory()) baseFolder.mkdirs();

        const gameDataFolder = new File(baseFolder.path + 'pet');

        if(!gameDataFolder.isDirectory()) gameDataFolder.mkdirs();

        return gameDataFolder;
    }

    private async mapXML2JSON(habboAssetSWF: HabboAssetSWF, assetType: string): Promise<IAssetData>
    {
        if(!habboAssetSWF) return null;

        const output: IAssetData = {};

        output.type = assetType;

        const indexXML = await PetConverter.getIndexXML(habboAssetSWF);

        if(indexXML) IndexMapper.mapXML(indexXML, output);

        const assetXML = await PetConverter.getAssetsXML(habboAssetSWF);

        if(assetXML)
        {
            AssetMapper.mapXML(assetXML, output);

            if(output.palettes !== undefined)
            {
                for(const paletteId in output.palettes)
                {
                    const palette = output.palettes[paletteId];

                    const paletteColors = PetConverter.getPalette(habboAssetSWF, palette.source);

                    if(!paletteColors)
                    {
                        delete output.palettes[paletteId];

                        continue;
                    }

                    const rgbs: [ number, number, number ][] = [];

                    for(const rgb of paletteColors) rgbs.push([ rgb[0], rgb[1], rgb[2] ]);

                    palette.rgb = rgbs;
                }
            }
        }

        const logicXML = await PetConverter.getLogicXML(habboAssetSWF);

        if(logicXML) LogicMapper.mapXML(logicXML, output);

        const visualizationXML = await PetConverter.getVisualizationXML(habboAssetSWF);

        if(visualizationXML) VisualizationMapper.mapXML(visualizationXML, output);

        return output;
    }
}
