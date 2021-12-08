import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { BundleProvider } from '../common/bundle/BundleProvider';
import { Configuration } from '../common/config/Configuration';
import { Converter } from '../common/converters/Converter';
import { SWFConverter } from '../common/converters/SWFConverter';
import { SWFDownloader } from '../common/SWFDownloader';
import { File } from '../utils/File';
import { FileUtilities } from '../utils/FileUtilities';
import { Logger } from '../utils/Logger';

@singleton()
export class PetConverter extends Converter
{
    constructor(
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        if(!this._configuration.getBoolean('convert.pet')) return;

        const now = Date.now();
        const spinner = ora('Preparing Pets').start();
        const baseUrl = this._configuration.getValue('dynamic.download.pet.url');
        const classNames = this.getPetTypes();
        const directory = FileUtilities.getDirectory(this._configuration.getValue('output.folder'), 'pet');

        for(const className of classNames)
        {
            try
            {
                const path = new File(directory.path + '/' + className + '.nitro');

                if(path.exists()) continue;

                const habboAssetSWF = await SWFDownloader.download(baseUrl, className, -1);

                if(!habboAssetSWF)
                {
                    spinner.text = 'Couldnt convert pet: ' + className;

                    spinner.render();

                    continue;
                }
                else
                {
                    spinner.text = 'Converting: ' + className;

                    spinner.render();
                }

                const spriteBundle = await BundleProvider.generateSpriteSheet(habboAssetSWF);
                const assetData = await SWFConverter.mapXML2JSON(habboAssetSWF, 'pet');
                const nitroBundle = SWFConverter.createNitroBundle(habboAssetSWF.getDocumentClass(), assetData, spriteBundle);

                await writeFile(path.path, await nitroBundle.toBufferAsync());

                spinner.text = 'Finished: ' + className;

                spinner.render();
            }

            catch (error)
            {
                spinner.text = `Error converting ${ className }: ${ error.message }`;

                spinner.render();

                continue;
            }
        }

        console.log();
        spinner.succeed(`Pets finished in ${ Date.now() - now }ms`);
    }

    private getPetTypes(): string[]
    {
        const petTypes: string[] = [];

        const pets = this._configuration.getValue('pet.configuration');

        if(pets)
        {
            const types = pets.split(',');

            for(const type of types) petTypes.push(type);
        }

        return petTypes;
    }
}
