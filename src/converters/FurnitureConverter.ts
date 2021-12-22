import ora from 'ora';
import { singleton } from 'tsyringe';
import { Configuration, ConverterResult, File, FileUtilities, IConverter, NitroBundle } from '../common';
import { GenerateFurnitureBundle, SWFDownloader } from '../swf';
import { FurnitureDataConverter } from './FurnitureDataConverter';

@singleton()
export class FurnitureConverter implements IConverter
{
    constructor(
        private readonly _furniDataConverter: FurnitureDataConverter,
        private readonly _configuration: Configuration)
    {}

    public async convertAsync(bundle: boolean = false, extract: boolean = false): Promise<void>
    {
        if(bundle) await this.convertInputToNitro();
        if(extract) await this.extractNitroToFolder();

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
                    spinner.text = `Converting: ${ className } (${ (i + 1) } / ${ totalClassNames })`;
                    spinner.render();

                    const downloadUrl = SWFDownloader.getDownloadUrl(downloadBase, className, revision);
                    const result = await this.convertSwfToNitro(className, downloadUrl, saveDirectory, false);

                    switch(result)
                    {
                        case ConverterResult.OK:
                            spinner.text = 'Converted: ' + className;
                            spinner.render();
                            break;
                        case ConverterResult.INVALID_SWF:
                            console.log();
                            console.error(`Invalid SWF: ${ downloadUrl }`);
                            break;
                    }
                }

                catch (error)
                {
                    console.log();
                    console.error(`Error Converting: ${ className } - ${ error.message }`);

                    continue;
                }
            }
        }

        spinner.succeed(`Furniture: Finished in ${ Date.now() - now }ms`);
    }

    public async convertInputToNitro(): Promise<void>
    {
        const now = Date.now();
        const spinner = ora('Preparing Furniture Inputs').start();
        const saveDirectory = await FileUtilities.getDirectory('./assets/bundled/furniture');
        const inputDirectory = await FileUtilities.getDirectory('./assets/bundle/furniture');
        const files = await inputDirectory.getFileList();

        for await (const name of files)
        {
            try
            {
                const [ className, extension, ...rest ] = name.split('.');
                const file = new File(`${ inputDirectory.path}/${ name }`);

                if(await file.isDirectory())
                {
                    spinner.text = `Bundling: ${ className }`;
                    spinner.render();

                    const nitroBundle = new NitroBundle();
                    const childFiles = await file.getFileList();

                    if(childFiles && childFiles.length)
                    {
                        for await (const childName of childFiles)
                        {
                            const childFile = new File(`${ file.path }/${ childName }`);

                            nitroBundle.addFile(childName, await childFile.getContentsAsBuffer());
                        }
                    }

                    if(nitroBundle.totalFiles)
                    {
                        const path = new File(`${ saveDirectory.path }/${ className }.nitro`);

                        await path.writeData(await nitroBundle.toBufferAsync());
                    }
                    else
                    {
                        console.log();
                        console.error(`Error Bundling: ${ name } - The bundle was empty`);

                        continue;
                    }

                    spinner.text = 'Bundled: ' + name;
                    spinner.render();
                }

                else if(extension === 'swf')
                {
                    spinner.text = `Converting: ${ className }`;
                    spinner.render();

                    const downloadUrl = `${ inputDirectory.path }/${ name }`;
                    const result = await this.convertSwfToNitro(className, file.path, saveDirectory, true);

                    switch(result)
                    {
                        case ConverterResult.OK:
                            spinner.text = 'Converted: ' + className;
                            spinner.render();
                            break;
                        case ConverterResult.INVALID_SWF:
                            console.log();
                            console.error(`Invalid SWF: ${ downloadUrl }`);
                            break;
                    }
                }
            }

            catch (error)
            {
                console.log();
                console.error(`Error Converting: ${ name } - ${ error.message }`);
            }
        }

        spinner.succeed(`Furniture Inputs: Finished in ${ Date.now() - now }ms`);
    }

    public async extractNitroToFolder(): Promise<void>
    {
        const now = Date.now();
        const spinner = ora('Preparing Furniture Extraction').start();
        const saveBaseDirectory = await FileUtilities.getDirectory('./assets/extracted/furniture');
        const inputDirectory = await FileUtilities.getDirectory('./assets/extract/furniture');
        const files = await inputDirectory.getFileList();

        for await (const name of files)
        {
            try
            {
                const [ className, extension, ...rest ] = name.split('.');
                const saveDirectory = await FileUtilities.getDirectory(`${ saveBaseDirectory.path }/${ className }`);
                const file = new File(`${ inputDirectory.path }/${ name }`);

                spinner.text = `Extracting: ${ className }`;
                spinner.render();

                if(extension === 'nitro')
                {
                    const nitroBundle = NitroBundle.from((await file.getContentsAsBuffer()).buffer);

                    for await (const [ bundleName, bundleBuffer ] of nitroBundle.files.entries())
                    {
                        const saveFile = new File(`${ saveDirectory.path }/${ bundleName }`);

                        await saveFile.writeData(bundleBuffer);
                    }
                }
            }

            catch (error)
            {
                console.log();
                console.error(`Error Extracting: ${ name } - ${ error.message }`);
            }
        }

        spinner.succeed(`Furniture Extraction: Finished in ${ Date.now() - now }ms`);
    }

    private async convertSwfToNitro(className: string, url: string, parentFile: File, overwrite: boolean = false): Promise<number>
    {
        if(!className || !url || !parentFile) return ConverterResult.BAD_ARGS;

        const file = new File(`${ parentFile.path }/${ className }.nitro`);

        if(!overwrite)
        {
            if(file.exists()) return ConverterResult.FILE_EXISTS;
        }

        const habboAssetSWF = await SWFDownloader.downloadFromUrl(url);

        if(!habboAssetSWF) return ConverterResult.INVALID_SWF;

        const nitroBundle = await GenerateFurnitureBundle(habboAssetSWF);

        await file.writeData(await nitroBundle.toBufferAsync());

        return ConverterResult.OK;
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
