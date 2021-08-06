import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { FileUtilities } from '../../utils/FileUtilities';

@singleton()
export class FigureMapDownloader
{
    constructor(private readonly _configuration: Configuration)
    {}

    public async download(callback: (content: string) => Promise<void>): Promise<void>
    {
        const figureMap = await this.parseFigureMap();

        if(!figureMap) throw new Error('invalid_figure_map');

        callback(figureMap);
    }

    public async parseFigureMap(): Promise<string>
    {
        const url = this._configuration.getValue('figuremap.load.url');

        if(!url || !url.length) return null;

        const logDownloads = this._configuration.getBoolean('misc.log_download_urls');

        if(logDownloads) console.log(`<Downloader> Downloading figure map from ${url}`);

        const content = await FileUtilities.readFileAsString(url);

        if(!content || !content.length) return null;

        return content;
    }
}
