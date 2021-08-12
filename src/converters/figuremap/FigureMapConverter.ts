import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { parseStringPromise } from 'xml2js';
import { Configuration } from '../../common/config/Configuration';
import { Converter } from '../../common/converters/Converter';
import { IFigureMap } from '../../mapping/json';
import { FigureMapMapper } from '../../mapping/mappers';
import File from '../../utils/File';
import { Logger } from '../../utils/Logger';
import { FigureMapDownloader } from './FigureMapDownloader';

@singleton()
export class FigureMapConverter extends Converter
{
    constructor(
        private readonly _figureMapDownloader: FigureMapDownloader,
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        return new Promise((resolve, reject) =>
        {
            const now = Date.now();

            const spinner = ora('Preparing FigureMap').start();

            const directory = this.getDirectory();

            try
            {
                this._figureMapDownloader.download(async (content: string) =>
                {
                    spinner.text = 'Parsing FigureMap';

                    spinner.render();

                    let figureMapString = content;

                    if(!figureMapString.startsWith('{'))
                    {
                        const xml = await parseStringPromise(figureMapString);

                        const figureMap = await this.mapXML2JSON(xml);

                        figureMapString = JSON.stringify(figureMap);
                    }

                    const path = directory.path + '/FigureMap.json';

                    await writeFile(path, figureMapString, 'utf8');

                    this._configuration.setValue('figuremap.load.url', path);

                    spinner.succeed(`FigureMap finished in ${ Date.now() - now }ms`);

                    resolve();
                });
            }

            catch (error)
            {
                spinner.fail('FigureMap failed: ' + error.message);

                reject(error);
            }
        });
    }

    private getDirectory(): File
    {
        const baseFolder = new File(this._configuration.getValue('output.folder'));

        if(!baseFolder.isDirectory()) baseFolder.mkdirs();

        const gameDataFolder = new File(baseFolder.path + '/gamedata');

        if(!gameDataFolder.isDirectory()) gameDataFolder.mkdirs();

        const jsonFolder = new File(gameDataFolder.path + '/json');

        if(!jsonFolder.isDirectory()) jsonFolder.mkdirs();

        return jsonFolder;
    }

    private async mapXML2JSON(xml: any): Promise<IFigureMap>
    {
        if(!xml) return null;

        const output: IFigureMap = {};

        FigureMapMapper.mapXML(xml, output);

        return output;
    }
}
