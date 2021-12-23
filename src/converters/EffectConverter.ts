import ora from 'ora';
import { singleton } from 'tsyringe';
import { Configuration, File, FileUtilities, IConverter } from '../common';
import { GenerateEffectBundle, SWFDownloader } from '../swf';
import { EffectMapConverter } from './EffectMapConverter';

@singleton()
export class EffectConverter implements IConverter
{
    public effectTypes: Map<string, string> = new Map();

    constructor(
        private readonly _effectMapConverter: EffectMapConverter,
        private readonly _configuration: Configuration)
    {}

    public async convertAsync(): Promise<void>
    {
        if(!this._configuration.getBoolean('convert.effect')) return;

        const now = Date.now();
        const spinner = ora('Preparing Effects').start();
        const downloadBase = this._configuration.getValue('dynamic.download.effect.url');
        const saveDirectory = await FileUtilities.getDirectory('./assets/bundled/effect');
        const effectMap = this._effectMapConverter.effectMap;
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

        if(classNames)
        {
            const totalClassNames = classNames.length;

            for(let i = 0; i < totalClassNames; i++)
            {
                const className = classNames[i];

                try
                {
                    const saveFile = new File(saveDirectory.path + '/' + className + '.nitro');

                    if(saveFile.exists()) continue;

                    spinner.text = `Converting: ${ className } (${ (i + 1) } / ${ totalClassNames })`;
                    spinner.render();

                    const downloadUrl = SWFDownloader.getDownloadUrl(downloadBase, className, -1);
                    const habboAssetSWF = await SWFDownloader.downloadFromUrl(downloadUrl);

                    if(!habboAssetSWF)
                    {
                        console.log();
                        console.error(`Invalid SWF: ${ className }`);

                        continue;
                    }

                    const nitroBundle = await GenerateEffectBundle(habboAssetSWF, className, this.effectTypes.get(className));

                    await saveFile.writeData(await nitroBundle.toBufferAsync());

                    spinner.text = `Converted: ${ className }`;
                    spinner.render();
                }

                catch (error)
                {
                    console.log();
                    console.error(`Error Converting: ${ className } - ${ error.message }`);

                    continue;
                }
            }
        }

        spinner.succeed(`Effects: Finished in ${ Date.now() - now }ms`);
    }
}
