import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { parseStringPromise } from 'xml2js';
import { Configuration } from '../../common/config/Configuration';
import { Converter } from '../../common/converters/Converter';
import { IEffectMap } from '../../mapping/json';
import { EffectMapMapper } from '../../mapping/mappers';
import File from '../../utils/File';
import { Logger } from '../../utils/Logger';
import { EffectMapDownloader } from './EffectMapDownloader';

@singleton()
export class EffectMapConverter extends Converter
{
    constructor(
        private readonly _effectMapDownloader: EffectMapDownloader,
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(): Promise<void>
    {
        const now = Date.now();

        const spinner = ora('Preparing EffectMap').start();

        const directory = this.getDirectory();

        try
        {
            await this._effectMapDownloader.download(async (content: string) =>
            {
                spinner.text = 'Parsing EffectMap';

                spinner.render();

                let effectMapString = content;

                if(!effectMapString.startsWith('{'))
                {
                    const xml = await parseStringPromise(effectMapString);

                    const effectMap = await this.mapXML2JSON(xml);

                    effectMapString = JSON.stringify(effectMap);
                }

                const path = directory.path + '/EffectMap.json';

                await writeFile(path, effectMapString, 'utf8');

                this._configuration.setValue('effectmap.load.url', path);
            });

            spinner.succeed(`EffectMap finished in ${ Date.now() - now }ms`);
        }

        catch (error)
        {
            spinner.fail('EffectMap failed: ' + error.message);
        }
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

    private async mapXML2JSON(xml: any): Promise<IEffectMap>
    {
        if(!xml) return null;

        const output: IEffectMap = {};

        EffectMapMapper.mapXML(xml, output);

        return output;
    }
}
