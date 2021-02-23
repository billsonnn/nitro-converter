import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { Converter } from '../../common/converters/Converter';
import { IProductData } from '../../mapping/json';
import File from '../../utils/File';
import { Logger } from '../../utils/Logger';
import { ProductDataDownloader } from './ProductDataDownloader';

@singleton()
export class ProductDataConverter extends Converter
{
    constructor(
        private readonly _productDataDownloader: ProductDataDownloader,
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(): Promise<void>
    {
        if(!this._configuration.getBoolean('convert.productdata')) return;

        return new Promise((resolve, reject) =>
        {
            const now = Date.now();

            const spinner = ora('Preparing ProductData').start();

            const directory = this.getDirectory();

            try
            {
                this._productDataDownloader.download(async (content: string) =>
                {
                    spinner.text = 'Parsing FurnitureData';

                    spinner.render();

                    let productDataString = content;

                    if(!productDataString.startsWith('{'))
                    {
                        const productData = await this.mapText2JSON(productDataString);

                        productDataString = JSON.stringify(productData);
                    }

                    const path = directory.path + '/ProductData.json';

                    await writeFile(path, productDataString, 'utf8');

                    spinner.succeed(`ProductData finished in ${ Date.now() - now }ms`);

                    resolve();
                });
            }

            catch (error)
            {
                spinner.fail('ProductData failed: ' + error.message);

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

    private async mapText2JSON(text: string): Promise<IProductData>
    {
        if(!text) return null;

        const output: IProductData = {
            productdata: {
                product: []
            }
        };

        text = text.replace(/"{1,}/g, '');

        const parts = text.split(/\n\r{1,}|\n{1,}|\r{1,}/mg);

        for(const part of parts)
        {
            const set = part.match(/\[+?((.)*?)\]/g);

            if(set)
            {
                for(const entry of set)
                {
                    let value = entry.replace(/\[{1,}/mg, '');
                    value = entry.replace(/\]{1,}/mg, '');

                    value = value.replace('[[', '');
                    value = value.replace('[', '');

                    const pieces = value.split(',');
                    const code = pieces.shift();
                    const name = pieces.shift();
                    const description = pieces.join(',');

                    output.productdata.product.push({ code, name, description });
                }
            }
        }

        return output;
    }
}
