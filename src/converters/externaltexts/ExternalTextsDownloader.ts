import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { FileUtilities } from '../../utils/FileUtilities';

@singleton()
export class ExternalTextsDownloader
{
    constructor(private readonly _configuration: Configuration)
    {}

    public async download(callback: (content: string) => Promise<void>): Promise<void>
    {
        const productData = await this.parseExternalTexts();

        if(!productData) throw new Error('invalid_external_texts');

        callback(productData);
    }

    public async parseExternalTexts(): Promise<string>
    {
        const url = this._configuration.getValue('external.texts.url');

        if(!url || !url.length) return null;

        const content = await FileUtilities.readFileAsString(url);

        if(!content || !content.length) return null;

        return content;
    }
}
