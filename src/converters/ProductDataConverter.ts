import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { Configuration } from '../common/config/Configuration';
import { Converter } from '../common/converters/Converter';
import { IProductData } from '../mapping/json';
import { FileUtilities } from '../utils/FileUtilities';

@singleton()
export class ProductDataConverter extends Converter
{
    public productData: IProductData = null;

    constructor(
        private readonly _configuration: Configuration)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        const now = Date.now();
        const spinner = ora('Preparing ProductData').start();
        const url = this._configuration.getValue('productdata.load.url');
        const content = await FileUtilities.readFileAsString(url);

        if(!content.startsWith('{'))
        {
            const productData = await this.mapText2JSON(content);

            this.productData = productData;
        }
        else
        {
            this.productData = JSON.parse(content);
        }

        const directory = FileUtilities.getDirectory(this._configuration.getValue('output.folder'), 'gamedata');
        const path = directory.path + '/ProductData.json';

        await writeFile(path, JSON.stringify(this.productData), 'utf8');

        spinner.succeed(`ProductData finished in ${ Date.now() - now }ms`);
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
