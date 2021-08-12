import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { Converter } from '../../common/converters/Converter';
import { IExternalTexts } from '../../mapping/json';
import File from '../../utils/File';
import { Logger } from '../../utils/Logger';
import { ExternalTextsDownloader } from './ExternalTextsDownloader';

@singleton()
export class ExternalTextsConverter extends Converter
{
    constructor(
        private readonly _externalTextsDownloader: ExternalTextsDownloader,
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        if(!this._configuration.getBoolean('convert.externaltexts')) return;

        return new Promise((resolve, reject) =>
        {
            const now = Date.now();

            const spinner = ora('Preparing ExternalTexts').start();

            const directory = this.getDirectory();

            try
            {
                this._externalTextsDownloader.download(async (content: string) =>
                {
                    spinner.text = 'Parsing ExternalTexts';

                    spinner.render();

                    let externalTextsString = content;

                    if(!externalTextsString.startsWith('{'))
                    {
                        const externalTexts = await this.mapText2JSON(externalTextsString);

                        externalTextsString = JSON.stringify(externalTexts);
                    }

                    const path = directory.path + '/ExternalTexts.json';

                    await writeFile(path, externalTextsString, 'utf8');

                    spinner.succeed(`ExternalTexts finished in ${ Date.now() - now }ms`);

                    resolve();
                });
            }

            catch (error)
            {
                spinner.fail('ExternalTexts failed: ' + error.message);

                reject(error);
            }
        });
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
