import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { parseStringPromise } from 'xml2js';
import { Configuration } from '../common/config/Configuration';
import { Converter } from '../common/converters/Converter';
import { IFigureData } from '../mapping/json/figuredata/IFigureData';
import { FigureDataMapper } from '../mapping/mappers/FigureDataMapper';
import { FileUtilities } from '../utils/FileUtilities';

@singleton()
export class FigureDataConverter extends Converter
{
    public figureData: IFigureData = null;

    constructor(
        private readonly _configuration: Configuration)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        const now = Date.now();
        const spinner = ora('Preparing FigureData').start();
        const url = this._configuration.getValue('figuredata.load.url');
        const content = await FileUtilities.readFileAsString(url);

        if(!content.startsWith('{'))
        {
            const xml = await parseStringPromise(content.replace(/&/g,'&amp;'));

            this.figureData = await this.mapXML2JSON(xml);
        }
        else
        {
            this.figureData = JSON.parse(content);
        }

        const directory = FileUtilities.getDirectory(this._configuration.getValue('output.folder'), 'gamedata');
        const path = directory.path + '/FigureData.json';

        await writeFile(path, JSON.stringify(this.figureData), 'utf8');

        spinner.succeed(`FigureData finished in ${ Date.now() - now }ms`);
    }

    private async mapXML2JSON(xml: any): Promise<IFigureData>
    {
        if(!xml) return null;

        const output: IFigureData = {};

        FigureDataMapper.mapXML(xml, output);

        return output;
    }
}
