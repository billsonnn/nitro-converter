import { writeFile } from 'fs/promises';
import ora from 'ora';
import { singleton } from 'tsyringe';
import { Configuration, File, FileUtilities, IConverter } from '../common';
import { GeneratePetBundle, SWFDownloader } from '../swf';

@singleton()
export class PetConverter implements IConverter
{
    constructor(
        private readonly _configuration: Configuration)
    {}

    public async convertAsync(): Promise<void>
    {
        if(!this._configuration.getBoolean('convert.pet')) return;

        const now = Date.now();
        const spinner = ora('Preparing Pets').start();
        const baseUrl = this._configuration.getValue('dynamic.download.pet.url');
        const classNames = this.getPetTypes();
        const directory = await FileUtilities.getDirectory('./assets/bundled/pet');

        if(classNames)
        {
            const totalClassNames = classNames.length;

            for(let i = 0; i < totalClassNames; i++)
            {
                const className = classNames[i];

                try
                {
                    const path = new File(directory.path + '/' + className + '.nitro');

                    if(path.exists()) continue;

                    spinner.text = `Converting: ${ className } (${ (i + 1) } / ${ totalClassNames })`;
                    spinner.render();

                    const habboAssetSWF = await SWFDownloader.download(baseUrl, className, -1);

                    if(!habboAssetSWF)
                    {
                        console.log();
                        console.error(`Invalid SWF: ${ className }`);

                        continue;
                    }

                    const nitroBundle = await GeneratePetBundle(habboAssetSWF);

                    await writeFile(path.path, await nitroBundle.toBufferAsync());

                    spinner.text = 'Converted: ' + className;
                    spinner.render();
                }

                catch (error)
                {
                    console.log();
                    console.error(`Error Converting: ${ className } - ${ error.message }`);

                    continue;
                }
            }
        }

        spinner.succeed(`Pets: Finished in ${ Date.now() - now }ms`);
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
