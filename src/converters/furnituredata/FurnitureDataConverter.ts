import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { parseStringPromise } from 'xml2js';
import { Configuration } from '../../common/config/Configuration';
import { Converter } from '../../common/converters/Converter';
import { IFurnitureData } from '../../mapping/json';
import { FurnitureDataMapper } from '../../mapping/mappers';
import File from '../../utils/File';
import { Logger } from '../../utils/Logger';
import { FurnitureDataDownloader } from './FurnitureDataDownloader';

@singleton()
export class FurnitureDataConverter extends Converter
{
    public furnitureData: IFurnitureData = null;

    constructor(
        private readonly _furnitureDataDownloader: FurnitureDataDownloader,
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

            const spinner = ora('Preparing FurnitureData').start();

            const directory = this.getDirectory();

            try
            {
                this._furnitureDataDownloader.download(async (content: string) =>
                {
                    spinner.text = 'Parsing FurnitureData';

                    spinner.render();

                    let furnitureDataString = content;

                    if(!furnitureDataString.startsWith('{'))
                    {
                        const xml = await parseStringPromise(furnitureDataString
                            .replace(/&/g,'&amp;'));

                        const furnitureData = await this.mapXML2JSON(xml);

                        this.furnitureData = furnitureData;

                        furnitureDataString = JSON.stringify(furnitureData);
                    }
                    else
                    {
                        this.furnitureData = JSON.parse(furnitureDataString);
                    }

                    const path = directory.path + '/FurnitureData.json';

                    await writeFile(path, furnitureDataString, 'utf8');

                    this._configuration.setValue('furnidata.load.url', path);

                    spinner.succeed(`FurnitureData finished in ${ Date.now() - now }ms`);

                    resolve();
                });
            }

            catch (error)
            {
                spinner.fail('FurnitureData failed: ' + error.message);

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

    private async mapXML2JSON(xml: any): Promise<IFurnitureData>
    {
        if(!xml) return null;

        const output: IFurnitureData = {};

        FurnitureDataMapper.mapXML(xml, output);

        return output;
    }
}
