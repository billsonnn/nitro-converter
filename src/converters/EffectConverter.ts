import { writeFile } from 'fs/promises';
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
        const baseUrl = this._configuration.getValue('dynamic.download.effect.url');
        const effectMap = this._effectMapConverter.effectMap;
        const directory = await FileUtilities.getDirectory('./assets/bundled/effect');

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
                    const path = new File(directory.path + '/' + className + '.nitro');

                    if(path.exists()) continue;

                    spinner.text = `Converting: ${ className } (${ (i + 1) } / ${ totalClassNames })`;
                    spinner.render();

                    const habboAssetSWF = await SWFDownloader.download(baseUrl, className, -1);

                    if(!habboAssetSWF)
                    {
                        console.log();
                        console.error(`Invalid SWF: ${ className }`);

                        continue;
                    }

                    const nitroBundle = await GenerateEffectBundle(habboAssetSWF, className, this.effectTypes.get(className));

                    await writeFile(path.path, await nitroBundle.toBufferAsync());

                    spinner.text = 'Converted: ' + className;
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
