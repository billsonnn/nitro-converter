import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { FileUtilities } from '../../utils/FileUtilities';

@singleton()
export class EffectMapDownloader
{
    constructor(private readonly _configuration: Configuration)
    {}

    public async download(callback: (content: string) => Promise<void>): Promise<void>
    {
        const effectMap = await this.parseEffectMap();

        if(!effectMap) throw new Error('invalid_effect_map');

        callback(effectMap);
    }

    public async parseEffectMap(): Promise<string>
    {
        const url = this._configuration.getValue('effectmap.load.url');

        if(!url || !url.length) return null;

        const content = await FileUtilities.readFileAsString(url);

        if(!content || !content.length) return null;

        return content;
    }
}
