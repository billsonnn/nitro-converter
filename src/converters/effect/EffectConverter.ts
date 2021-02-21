import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { BundleProvider } from '../../common/bundle/BundleProvider';
import { Configuration } from '../../common/config/Configuration';
import { SWFConverter } from '../../common/converters/SWFConverter';
import { IAssetData } from '../../mapping/json';
import { AnimationMapper, ManifestMapper } from '../../mapping/mappers';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import File from '../../utils/File';
import { Logger } from '../../utils/Logger';
import { EffectDownloader } from './EffectDownloader';

@singleton()
export class EffectConverter extends SWFConverter
{
    constructor(
        private readonly _effectDownloader: EffectDownloader,
        private readonly _configuration: Configuration,
        private readonly _bundleProvider: BundleProvider,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(): Promise<void>
    {
        const now = Date.now();

        const spinner = ora('Preparing Effects').start();

        const directory = this.getDirectory();

        try
        {
            await this._effectDownloader.download(async (habboAssetSwf: HabboAssetSWF, className: string) =>
            {
                spinner.text = 'Parsing Effect: ' + habboAssetSwf.getDocumentClass();

                spinner.render();

                const spriteBundle = await this._bundleProvider.generateSpriteSheet(habboAssetSwf);
                const assetData = await this.mapXML2JSON(habboAssetSwf, className);

                await this.fromHabboAsset(habboAssetSwf, directory.path, assetData.type, assetData, spriteBundle);
            });

            spinner.succeed(`Effects finished in ${ Date.now() - now }ms`);
        }

        catch (error)
        {
            spinner.fail('Effects failed: ' + error.message);
        }
    }

    private getDirectory(): File
    {
        const baseFolder = new File(this._configuration.getValue('output.folder'));

        if(!baseFolder.isDirectory()) baseFolder.mkdirs();

        const gameDataFolder = new File(baseFolder.path + 'effect');

        if(!gameDataFolder.isDirectory()) gameDataFolder.mkdirs();

        return gameDataFolder;
    }

    private async mapXML2JSON(habboAssetSWF: HabboAssetSWF, assetType: string): Promise<IAssetData>
    {
        if(!habboAssetSWF) return null;

        const output: IAssetData = {};

        output.name = assetType;
        output.type = EffectDownloader.EFFECT_TYPES.get(assetType);

        const manifestXML = await EffectConverter.getManifestXML(habboAssetSWF);

        if(manifestXML) ManifestMapper.mapXML(manifestXML, output);

        const animationXML = await EffectConverter.getAnimationXML(habboAssetSWF);

        if(animationXML) AnimationMapper.mapXML(animationXML, output);

        return output;
    }
}
