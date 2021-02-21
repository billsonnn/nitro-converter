import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { FileUtilities } from '../../utils/FileUtilities';

@singleton()
export class ProductDataDownloader
{
    constructor(private readonly _configuration: Configuration)
    {}

    public async download(callback: (content: string) => Promise<void>): Promise<void>
    {
        const productData = await this.parseProductData();

        if(!productData) throw new Error('invalid_product_data');

        callback(productData);
    }

    public async parseProductData(): Promise<string>
    {
        const url = this._configuration.getValue('productdata.load.url');

        if(!url || !url.length) return null;

        const content = await FileUtilities.readFileAsString(url);

        if(!content || !content.length) return null;

        return content;
    }
}
