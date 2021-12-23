import ora from 'ora';
import { singleton } from 'tsyringe';
import { Configuration, File, FileUtilities, IConverter } from '../common';
import { GenerateFurnitureBundle, SWFDownloader } from '../swf';
import { FurnitureDataConverter } from './FurnitureDataConverter';

@singleton()
export class FurnitureConverter implements IConverter
{
    constructor(
        private readonly _furniDataConverter: FurnitureDataConverter,
        private readonly _configuration: Configuration)
    {}

    public async convertAsync(): Promise<void>
    {
        if(!this._configuration.getBoolean('convert.furniture')) return;

        const now = Date.now();
        const spinner = ora('Preparing Furniture').start();
        const downloadBase = this._configuration.getValue('dynamic.download.furniture.url');
        const saveDirectory = await FileUtilities.getDirectory('./assets/bundled/furniture');
        const { classNames, revisions } = this._furniDataConverter.getClassNamesAndRevisions(this.floorOnly, this.wallOnly);

        if(classNames)
        {
            const totalClassNames = classNames.length;

            for(let i = 0; i < totalClassNames; i++)
            {
                const className = classNames[i];
                const revision = revisions[i];

                try
                {
                    const saveFile = new File(`${ saveDirectory.path }/${ className }.nitro`);

                    if(saveFile.exists()) continue;

                    spinner.text = `Converting: ${ className } (${ (i + 1) } / ${ totalClassNames })`;
                    spinner.render();

                    const downloadUrl = SWFDownloader.getDownloadUrl(downloadBase, className, revision);
                    const habboAssetSWF = await SWFDownloader.downloadFromUrl(downloadUrl);

                    if(!habboAssetSWF)
                    {
                        console.log();
                        console.error(`Invalid SWF: ${ downloadUrl }`);

                        continue;
                    }

                    const nitroBundle = await GenerateFurnitureBundle(habboAssetSWF);

                    await saveFile.writeData(await nitroBundle.toBufferAsync());

                    spinner.text = `Converted: ${ className }`;
                    spinner.render();
                }

                catch (error)
                {
                    console.log();
                    console.error(`Error Converting: ${ className } - ${ error.message }`);
                }
            }
        }

        spinner.succeed(`Furniture: Finished in ${ Date.now() - now }ms`);
    }

    public get floorOnly(): boolean
    {
        return (this._configuration.getBoolean('convert.furniture.floor.only') || false);
    }

    public get wallOnly(): boolean
    {
        return (this._configuration.getBoolean('convert.furniture.wall.only') || false);
    }
}
