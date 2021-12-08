import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { BundleProvider } from '../common/bundle/BundleProvider';
import { Configuration } from '../common/config/Configuration';
import { SWFConverter } from '../common/converters/SWFConverter';
import { SWFDownloader } from '../common/SWFDownloader';
import { File } from '../utils/File';
import { FileUtilities } from '../utils/FileUtilities';
import { FigureMapConverter } from './FigureMapConverter';

@singleton()
export class FigureConverter
{
    public figureTypes: Map<string, string> = new Map();

    constructor(
        private readonly _figureMapConverter: FigureMapConverter,
        private readonly _configuration: Configuration)
    {}

    public async convertAsync(args: string[] = []): Promise<void>
    {
        if(!this._configuration.getBoolean('convert.figure')) return;

        const now = Date.now();
        const spinner = ora('Preparing Figure').start();
        const baseUrl = this._configuration.getValue('dynamic.download.figure.url');
        const figureMap = this._figureMapConverter.figureMap;
        const directory = FileUtilities.getDirectory(this._configuration.getValue('output.folder'), 'figure');
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

        for(const className of classNames)
        {
            try
            {
                const path = new File(directory.path + '/' + className + '.nitro');

                if(path.exists()) continue;

                const habboAssetSWF = await SWFDownloader.download(baseUrl, className, -1);

                if(!habboAssetSWF)
                {
                    spinner.text = 'Couldnt convert figure: ' + className;

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
                    assetData.type = this.figureTypes.get(className);
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
        spinner.succeed(`Figures finished in ${ Date.now() - now }ms`);
    }
}
