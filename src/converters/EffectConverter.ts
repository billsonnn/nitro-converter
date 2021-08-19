import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { BundleProvider } from '../common/bundle/BundleProvider';
import { Configuration } from '../common/config/Configuration';
import { Converter } from '../common/converters/Converter';
import { SWFConverter } from '../common/converters/SWFConverter';
import { SWFDownloader } from '../common/SWFDownloader';
import { File } from '../utils/File';
import { FileUtilities } from '../utils/FileUtilities';
import { EffectMapConverter } from './EffectMapConverter';

@singleton()
export class EffectConverter extends Converter
{
    public effectTypes: Map<string, string> = new Map();

    constructor(
        private readonly _effectMapConverter: EffectMapConverter,
        private readonly _configuration: Configuration)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        if(!this._configuration.getBoolean('convert.effect')) return;

        const now = Date.now();
        const spinner = ora('Preparing Effects').start();
        const baseUrl = this._configuration.getValue('dynamic.download.effect.url');
        const effectMap = this._effectMapConverter.effectMap;
        const directory = FileUtilities.getDirectory(this._configuration.getValue('output.folder'), 'effect');

        const classNames: string[] = [];

        if(effectMap.effects !== undefined)
        {
            for(const library of effectMap.effects)
            {
                const className = library.lib;

                if(classNames.indexOf(className) >= 0) continue;

                classNames.push(className);

                this.effectTypes.set(className, library.type);
            }
        }

        for(const className of classNames)
        {
            try
            {
                const path = new File(directory.path + '/' + className + '.nitro');

                if(path.exists()) continue;

                const habboAssetSWF = await SWFDownloader.download(baseUrl, className, -1);

                if(!habboAssetSWF)
                {
                    spinner.text = 'Couldnt convert effect: ' + className;

                    spinner.render();

                    continue;
                }
                else
                {
                    spinner.text = 'Converting: ' + className;

                    spinner.render();
                }

                const spriteBundle = await BundleProvider.generateSpriteSheet(habboAssetSWF);
                const assetData = await SWFConverter.mapXML2JSON(habboAssetSWF, className);

                if(assetData)
                {
                    assetData.name = className;
                    assetData.type = this.effectTypes.get(className);
                }

                const nitroBundle = SWFConverter.createNitroBundle(habboAssetSWF.getDocumentClass(), assetData, spriteBundle);

                await writeFile(path.path, await nitroBundle.toBufferAsync());

                spinner.text = 'Finished: ' + className;

                spinner.render();
            }

            catch (error)
            {
                spinner.text = `Error converting ${ className }: ${ error.message }`;

                spinner.render();

                continue;
            }
        }

        console.log();
        spinner.succeed(`Effects finished in ${ Date.now() - now }ms`);
    }
}
