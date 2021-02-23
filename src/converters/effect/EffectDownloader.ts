import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { IEffectMap } from '../../mapping/json';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import File from '../../utils/File';
import { FileUtilities } from '../../utils/FileUtilities';
import { Logger } from '../../utils/Logger';
import { EffectMapConverter } from '../effectmap/EffectMapConverter';

@singleton()
export class EffectDownloader
{
    public static EFFECT_TYPES: Map<string, string> = new Map();

    constructor(
        private readonly _effectMapConverter: EffectMapConverter,
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {}

    public async download(directory: File, callback: (habboAssetSwf: HabboAssetSWF, className: string) => Promise<void>): Promise<void>
    {
        await this._effectMapConverter.convertAsync();

        const effectMap = await this.parseEffectMap();
        const classNames: string[] = [];

        if(effectMap.effects !== undefined)
        {
            for(const library of effectMap.effects)
            {
                const className = library.lib;

                const existingFile = new File(directory.path + '/' + className + '.nitro');

                if(existingFile.isDirectory()) continue;

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

                    this._logger.logError(`Error parsing ${ className }: ` + error.message);
                }
            }
        }
    }

    public async parseEffectMap(): Promise<IEffectMap>
    {
        const url = this._configuration.getValue('effectmap.load.url');

        if(!url || !url.length) return null;

        const content = await FileUtilities.readFileAsString(url);

        if(!content || !content.length) return null;

        return (JSON.parse(content) as IEffectMap);
    }

    public async extractEffect(className: string, callback: (habboAssetSwf: HabboAssetSWF, className: string) => Promise<void>): Promise<void>
    {
        let url = this._configuration.getValue('dynamic.download.effect.url');

        if(!url || !url.length) return;

        url = url.replace('%className%', className);

        const buffer = await FileUtilities.readFileAsBuffer(url);

        if(!buffer) return;

        const newHabboAssetSWF = new HabboAssetSWF(buffer);

        await newHabboAssetSWF.setupAsync();

        await callback(newHabboAssetSWF, className);
    }
}
