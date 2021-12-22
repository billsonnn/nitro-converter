import { writeFile } from 'fs/promises';
import ora from 'ora';
import { singleton } from 'tsyringe';
import { Configuration, File, FileUtilities, IConverter } from '../common';
import { GenerateFigureBundle, SWFDownloader } from '../swf';
import { FigureMapConverter } from './FigureMapConverter';

@singleton()
export class FigureConverter implements IConverter
{
    public figureTypes: Map<string, string> = new Map();

    constructor(
        private readonly _figureMapConverter: FigureMapConverter,
        private readonly _configuration: Configuration)
    {}

    public async convertAsync(): Promise<void>
    {
        if(!this._configuration.getBoolean('convert.figure')) return;

        const now = Date.now();
        const spinner = ora('Preparing Figure').start();
        const baseUrl = this._configuration.getValue('dynamic.download.figure.url');
        const figureMap = this._figureMapConverter.figureMap;
        const directory = await FileUtilities.getDirectory('./assets/bundled/figure');
        const classNames: string[] = [];

        if(figureMap.libraries !== undefined)
        {
            for(const library of figureMap.libraries)
            {
                const className = library.id.split('*')[0];

                if(className === 'hh_human_fx' || className === 'hh_pets') continue;

                if(classNames.indexOf(className) >= 0) continue;

                classNames.push(className);

                this.figureTypes.set(className, library.parts[0].type);
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

                    const nitroBundle = await GenerateFigureBundle(habboAssetSWF, className, this.figureTypes.get(className));

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

        spinner.succeed(`Figures: Finished in ${ Date.now() - now }ms`);
    }
}
