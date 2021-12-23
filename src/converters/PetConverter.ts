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
        const downloadBase = this._configuration.getValue('dynamic.download.pet.url');
        const saveDirectory = await FileUtilities.getDirectory('./assets/bundled/pet');
        const classNames = this.getPetTypes();

        if(classNames)
        {
            const totalClassNames = classNames.length;

            for(let i = 0; i < totalClassNames; i++)
            {
                const className = classNames[i];

                try
                {
                    const saveFile = new File(`${ saveDirectory.path }/${ className }.nitro`);

                    if(saveFile.exists()) continue;

                    spinner.text = `Converting: ${ className } (${ (i + 1) } / ${ totalClassNames })`;
                    spinner.render();

                    const downloadUrl = SWFDownloader.getDownloadUrl(downloadBase, className, -1);
                    const habboAssetSWF = await SWFDownloader.downloadFromUrl(downloadUrl);

                    if(!habboAssetSWF)
                    {
                        console.log();
                        console.error(`Invalid SWF: ${ className }`);

                        continue;
                    }

                    const nitroBundle = await GeneratePetBundle(habboAssetSWF);

                    await saveFile.writeData(await nitroBundle.toBufferAsync());

                    spinner.text = `Converted: ${ className }`;
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
