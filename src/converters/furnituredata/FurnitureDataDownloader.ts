import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { FileUtilities } from '../../utils/FileUtilities';

@singleton()
export class FurnitureDataDownloader
{
    constructor(private readonly _configuration: Configuration)
    {
    }

    public async download(callback: (content: string) => Promise<void>): Promise<void>
    {
        const furnitureData = await this.parseFurnitureData();

        if(!furnitureData) throw new Error('invalid_furniture_data');

        callback(furnitureData);
    }

    public async parseFurnitureData(): Promise<string>
    {
        const url = this._configuration.getValue('furnidata.load.url');

        if(!url || !url.length) return null;

        const logDownloads = this._configuration.getBoolean('misc.log_download_urls');

        if(logDownloads) console.log(`<Downloader> Downloading furniture data from ${url}`);

        const content = await FileUtilities.readFileAsString(url);

        if(!content || !content.length) return null;

        return content;
    }
}
