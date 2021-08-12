import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { parseStringPromise } from 'xml2js';
import { Configuration } from '../../common/config/Configuration';
import { Converter } from '../../common/converters/Converter';
import { FigureDataMapper } from '../../mapping/mappers/FigureDataMapper';
import File from '../../utils/File';
import { Logger } from '../../utils/Logger';
import { IFigureData } from './../../mapping/json/figuredata/IFigureData';
import { FigureDataDownloader } from './FigureDataDownloader';

@singleton()
export class FigureDataConverter extends Converter
{
    constructor(
        private readonly _figureDataDownloader: FigureDataDownloader,
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        if(!this._configuration.getBoolean('convert.figuredata')) return;

        return new Promise((resolve, reject) =>
        {
            const now = Date.now();

            const spinner = ora('Preparing FigureData').start();

            const directory = this.getDirectory();

            try
            {
                this._figureDataDownloader.download(async (content: string) =>
                {
                    spinner.text = 'Parsing FigureData';

                    spinner.render();

                    let figureDataString = content;

                    if(!figureDataString.startsWith('{'))
                    {
                        const xml = await parseStringPromise(figureDataString);

                        const figureData = await this.mapXML2JSON(xml);

                        figureDataString = JSON.stringify(figureData);
                    }

                    const path = directory.path + '/FigureData.json';

                    await writeFile(path, figureDataString, 'utf8');

                    this._configuration.setValue('figuredata.load.url', path);

                    spinner.succeed(`FigureData finished in ${ Date.now() - now }ms`);

                    resolve();
                });
            }

            catch (error)
            {
                spinner.fail('FigureData failed: ' + error.message);

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

    private async mapXML2JSON(xml: any): Promise<IFigureData>
    {
        if(!xml) return null;

        const output: IFigureData = {};

        FigureDataMapper.mapXML(xml, output);

        return output;
    }
}
