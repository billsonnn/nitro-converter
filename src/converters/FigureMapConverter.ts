import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { parseStringPromise } from 'xml2js';
import { Configuration } from '../common/config/Configuration';
import { Converter } from '../common/converters/Converter';
import { IFigureMap } from '../mapping/json';
import { FigureMapMapper } from '../mapping/mappers';
import { FileUtilities } from '../utils/FileUtilities';
import { Logger } from '../utils/Logger';

@singleton()
export class FigureMapConverter extends Converter
{
    public figureMap: IFigureMap = null;

    constructor(
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        const now = Date.now();
        const spinner = ora('Preparing FigureMap').start();
        const url = this._configuration.getValue('figuremap.load.url');
        const content = await FileUtilities.readFileAsString(url);

        if(!content.startsWith('{'))
        {
            const xml = await parseStringPromise(content.replace(/&/g,'&amp;'));

            this.figureMap = await this.mapXML2JSON(xml);
        }
        else
        {
            this.figureMap = JSON.parse(content);
        }

        const directory = FileUtilities.getDirectory(this._configuration.getValue('output.folder'), 'gamedata');
        const path = directory.path + '/FigureMap.json';

        await writeFile(path, JSON.stringify(this.figureMap), 'utf8');

        spinner.succeed(`FigureMap finished in ${ Date.now() - now }ms`);
    }

    private async mapXML2JSON(xml: any): Promise<IFigureMap>
    {
        if(!xml) return null;

        const output: IFigureMap = {};

        FigureMapMapper.mapXML(xml, output);

        return output;
    }
}
