import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { parseStringPromise } from 'xml2js';
import { Configuration } from '../common/config/Configuration';
import { Converter } from '../common/converters/Converter';
import { IFurnitureData } from '../mapping/json';
import { FurnitureDataMapper } from '../mapping/mappers';
import { FileUtilities } from '../utils/FileUtilities';

@singleton()
export class FurnitureDataConverter extends Converter
{
    public furnitureData: IFurnitureData = null;

    constructor(
        private readonly _configuration: Configuration)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        const now = Date.now();
        const spinner = ora('Preparing FurnitureData').start();
        const url = this._configuration.getValue('furnidata.load.url');
        const content = await FileUtilities.readFileAsString(url);

        if(!content.startsWith('{'))
        {
            const xml = await parseStringPromise(content.replace(/&/g,'&amp;'));
            const furnitureData = await this.mapXML2JSON(xml);

            this.furnitureData = furnitureData;
        }
        else
        {
            this.furnitureData = JSON.parse(content);
        }

        const directory = FileUtilities.getDirectory(this._configuration.getValue('output.folder'), 'gamedata');
        const path = directory.path + '/FurnitureData.json';

        await writeFile(path, JSON.stringify(this.furnitureData), 'utf8');

        spinner.succeed(`FurnitureData finished in ${ Date.now() - now }ms`);
    }

    private async mapXML2JSON(xml: any): Promise<IFurnitureData>
    {
        if(!xml) return null;

        const output: IFurnitureData = {};

        FurnitureDataMapper.mapXML(xml, output);

        return output;
    }
}
