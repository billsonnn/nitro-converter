import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { FileUtilities } from '../../utils/FileUtilities';

@singleton()
export class FigureDataDownloader
{
    constructor(private readonly _configuration: Configuration)
    {}

    public async download(callback: (content: string) => Promise<void>): Promise<void>
    {
        const figureData = await this.parseFigureData();

        if(!figureData) throw new Error('invalid_figure_data');

        callback(figureData);
    }

    public async parseFigureData(): Promise<string>
    {
        const url = this._configuration.getValue('figuredata.load.url');

        if(!url || !url.length) return null;

        const content = await FileUtilities.readFileAsString(url);

        if(!content || !content.length) return null;

        return content;
    }
}
