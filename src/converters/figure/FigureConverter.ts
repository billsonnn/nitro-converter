import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { BundleProvider } from '../../common/bundle/BundleProvider';
import { Configuration } from '../../common/config/Configuration';
import { SWFConverter } from '../../common/converters/SWFConverter';
import { IAssetData } from '../../mapping/json';
import { ManifestMapper } from '../../mapping/mappers';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import File from '../../utils/File';
import { Logger } from '../../utils/Logger';
import { FigureDownloader } from './FigureDownloader';

@singleton()
export class FigureConverter extends SWFConverter
{
    constructor(
        private readonly _figureDownloader: FigureDownloader,
        private readonly _configuration: Configuration,
        private readonly _bundleProvider: BundleProvider,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(): Promise<void>
    {
        const now = Date.now();

        const spinner = ora('Preparing Figure').start();

        const directory = this.getDirectory();

        try
        {
            await this._figureDownloader.download(async (habboAssetSwf: HabboAssetSWF, className: string) =>
            {
                spinner.text = 'Parsing Figure: ' + habboAssetSwf.getDocumentClass();

                spinner.render();

                const spriteBundle = await this._bundleProvider.generateSpriteSheet(habboAssetSwf);
                const assetData = await this.mapXML2JSON(habboAssetSwf, className);

                await this.fromHabboAsset(habboAssetSwf, directory.path, assetData.type, assetData, spriteBundle);
            });

            spinner.succeed(`Figures finished in ${ Date.now() - now }ms`);
        }

        catch (error)
        {
            spinner.fail('Figures failed: ' + error.message);
        }
    }

    private getDirectory(): File
    {
        const baseFolder = new File(this._configuration.getValue('output.folder'));

        if(!baseFolder.isDirectory()) baseFolder.mkdirs();

        const gameDataFolder = new File(baseFolder.path + 'figure');

        if(!gameDataFolder.isDirectory()) gameDataFolder.mkdirs();

        return gameDataFolder;
    }

    private async mapXML2JSON(habboAssetSWF: HabboAssetSWF, assetType: string): Promise<IAssetData>
    {
        if(!habboAssetSWF) return null;

        const output: IAssetData = {};

        output.name = assetType;
        output.type = FigureDownloader.FIGURE_TYPES.get(assetType);

        const manifestXML = await FigureConverter.getManifestXML(habboAssetSWF);

        if(manifestXML) ManifestMapper.mapXML(manifestXML, output);

        return output;
    }
}
