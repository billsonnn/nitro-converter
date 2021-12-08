import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { parseStringPromise } from 'xml2js';
import { Configuration } from '../common/config/Configuration';
import { Converter } from '../common/converters/Converter';
import { IEffectMap } from '../mapping/json';
import { EffectMapMapper } from '../mapping/mappers';
import { FileUtilities } from '../utils/FileUtilities';

@singleton()
export class EffectMapConverter extends Converter
{
    public effectMap: IEffectMap = null;

    constructor(
        private readonly _configuration: Configuration)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        const now = Date.now();
        const spinner = ora('Preparing EffectMap').start();
        const url = this._configuration.getValue('effectmap.load.url');
        const content = await FileUtilities.readFileAsString(url);

        if(!content.startsWith('{'))
        {
            const xml = await parseStringPromise(content.replace(/&/g,'&amp;'));

            this.effectMap = await this.mapXML2JSON(xml);
        }
        else
        {
            this.effectMap = JSON.parse(content);
        }

        const directory = FileUtilities.getDirectory(this._configuration.getValue('output.folder'), 'gamedata');
        const path = directory.path + '/EffectMap.json';

        await writeFile(path, JSON.stringify(this.effectMap), 'utf8');

        spinner.succeed(`EffectMap finished in ${ Date.now() - now }ms`);
    }

    private async mapXML2JSON(xml: any): Promise<IEffectMap>
    {
        if(!xml) return null;

        const output: IEffectMap = {};

        EffectMapMapper.mapXML(xml, output);

        return output;
    }
}
