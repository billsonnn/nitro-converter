import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { Configuration } from '../common/config/Configuration';
import { Converter } from '../common/converters/Converter';
import { IExternalTexts } from '../mapping/json';
import { FileUtilities } from '../utils/FileUtilities';

@singleton()
export class ExternalTextsConverter extends Converter
{
    public externalTexts: IExternalTexts = null;

    constructor(
        private readonly _configuration: Configuration)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        const now = Date.now();
        const spinner = ora('Preparing ExternalTexts').start();
        const url = this._configuration.getValue('external.texts.url');
        const content = await FileUtilities.readFileAsString(url);

        if(!content.startsWith('{'))
        {
            this.externalTexts = await this.mapText2JSON(content);
        }
        else
        {
            this.externalTexts = JSON.parse(content);
        }

        const directory = FileUtilities.getDirectory(this._configuration.getValue('output.folder'), 'gamedata');
        const path = directory.path + '/ExternalTexts.json';

        await writeFile(path, JSON.stringify(this.externalTexts), 'utf8');

        spinner.succeed(`ExternalTexts finished in ${ Date.now() - now }ms`);
    }

    private async mapText2JSON(text: string): Promise<IExternalTexts>
    {
        if(!text) return null;

        const output: IExternalTexts = {};

        const parts = text.split(/\n\r{1,}|\n{1,}|\r{1,}/mg);

        for(const part of parts)
        {
            const [ key, value ] = part.split('=');

            output[key] = value;
        }

        return output;
    }
}
