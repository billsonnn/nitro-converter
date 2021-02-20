import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { IEffectMap } from '../../mapping/json';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import { FileUtilities } from '../../utils/FileUtilities';

@singleton()
export class EffectDownloader
{
    public static EFFECT_TYPES: Map<string, string> = new Map();

    constructor(private readonly _configuration: Configuration)
    {}

    public async download(callback: (habboAssetSwf: HabboAssetSWF, className: string) => Promise<void>): Promise<void>
    {
        const effectMap = await this.parseEffectMap();
        const classNames: string[] = [];

        if(effectMap.effects !== undefined)
        {
            for(const library of effectMap.effects)
            {
                const className = library.lib;

                if(classNames.indexOf(className) >= 0) continue;

                classNames.push(className);

                try
                {
                    EffectDownloader.EFFECT_TYPES.set(className, library.type);

                    await this.extractEffect(className, callback);
                }

                catch (error)
                {
                    console.log();
                    console.error(`Error parsing ${ className }: ` + error.message);
                }
            }
        }
    }

    public async parseEffectMap(): Promise<IEffectMap>
    {
        const url = this._configuration.getValue('effectmap.url');

        if(!url || !url.length) return null;

        const content = await FileUtilities.readFileAsString(url);

        if(!content || !content.length) return null;

        return (JSON.parse(content) as IEffectMap);
    }

    public async extractEffect(className: string, callback: (habboAssetSwf: HabboAssetSWF, className: string) => Promise<void>): Promise<void>
    {
        let url = this._configuration.getValue('dynamic.download.url.effect');

        if(!url || !url.length) return;

        url = url.replace('%className%', className);

        const buffer = await FileUtilities.readFileAsBuffer(url);

        if(!buffer) return;

        const newHabboAssetSWF = new HabboAssetSWF(buffer);

        await newHabboAssetSWF.setupAsync();

        await callback(newHabboAssetSWF, className);
    }
}
