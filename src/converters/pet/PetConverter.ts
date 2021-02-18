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

        const outputFolder = new File(this._configuration.getValue('output.folder.pet'));

        if(!outputFolder.isDirectory()) outputFolder.mkdirs();

        try
        {
            await this._petDownloader.download(async (habboAssetSwf: HabboAssetSWF) =>
            {
                spinner.text = 'Parsing Pet: ' + habboAssetSwf.getDocumentClass();

                spinner.render();

                const spriteBundle = await this._bundleProvider.generateSpriteSheet(habboAssetSwf);
                const assetData = await this.mapXML2JSON(habboAssetSwf, 'pet');

                await this.fromHabboAsset(habboAssetSwf, outputFolder.path, 'pet', assetData, spriteBundle);
            });

            spinner.succeed(`Pets finished in ${ Date.now() - now }ms`);
        }

        catch (error)
        {
            spinner.fail('Pet failed: ' + error.message);
        }
    }

    private async mapXML2JSON(habboAssetSWF: HabboAssetSWF, assetType: string): Promise<IAssetData>
    {
        if(!habboAssetSWF) return null;

        const assetData: IAssetData = {};

        assetData.type = assetType;

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
}
