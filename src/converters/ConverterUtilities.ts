import ora from 'ora';
import { singleton } from 'tsyringe';
import { File, FileUtilities, NitroBundle } from '../common';
import { GenerateFurnitureBundle, SWFDownloader } from '../swf';

@singleton()
export class ConverterUtilities
{
    private static BUNDLE_TYPES: string[] = [ 'furniture', 'figure', 'effect', 'pet', 'generic' ];

    public async extractNitroFromFolder(): Promise<void>
    {
        const now = Date.now();
        const spinner = ora('Preparing Extraction').start();
        const extractBaseDirectory = await FileUtilities.getDirectory('./assets/extract');
        const extractedBaseDirectory = await FileUtilities.getDirectory('./assets/extracted');

        for await (const type of ConverterUtilities.BUNDLE_TYPES)
        {
            const extractTypeDirectory = await FileUtilities.getDirectory(`${ extractBaseDirectory.path }/${ type }`);
            const extractedTypeDirectory = await FileUtilities.getDirectory(`${ extractedBaseDirectory.path }/${ type }`);
            const files = await extractTypeDirectory.getFileList();

            for await (const name of files)
            {
                const [ className, extension, ...rest ] = name.split('.');

                try
                {
                    spinner.text = `Extracting: ${ className }`;
                    spinner.render();

                    const saveDirectory = await FileUtilities.getDirectory(`${ extractedTypeDirectory.path }/${ className }`);

                    const file = new File(`${ extractTypeDirectory.path }/${ name }`);

                    if(extension === 'nitro')
                    {
                        const nitroBundle = NitroBundle.from((await file.getContentsAsBuffer()).buffer);

                        for await (const [ bundleName, bundleBuffer ] of nitroBundle.files.entries())
                        {
                            const saveFile = new File(`${ saveDirectory.path }/${ bundleName }`);

                            await saveFile.writeData(bundleBuffer);
                        }

                        spinner.text = `Extracted: ${ className }`;
                        spinner.render();
                    }
                }

                catch (error)
                {
                    console.log();
                    console.error(`Error Extracting: ${ name } - ${ error.message }`);
                }
            }
        }

        spinner.succeed(`Extraction: Finished in ${ Date.now() - now }ms`);
    }

    public async convertSwfFromFolder(): Promise<void>
    {
        const now = Date.now();
        const spinner = ora('Preparing SWF Extraction').start();
        const swfBaseDirectory = await FileUtilities.getDirectory('./assets/swf');
        const bundledBaseDirectory = await FileUtilities.getDirectory('./assets/bundled');

        for await (const type of ConverterUtilities.BUNDLE_TYPES)
        {
            const swfTypeDirectory = await FileUtilities.getDirectory(`${ swfBaseDirectory.path }/${ type }`);
            const bundledTypeDirectory = await FileUtilities.getDirectory(`${ bundledBaseDirectory.path }/${ type }`);
            const files = await swfTypeDirectory.getFileList();

            for await (const name of files)
            {
                const [ className, extension, ...rest ] = name.split('.');

                try
                {
                    spinner.text = `Extracting SWF: ${ className }`;
                    spinner.render();

                    const downloadUrl = `${ swfTypeDirectory.path }/${ className }.swf`;
                    const habboAssetSwf = await SWFDownloader.downloadFromUrl(downloadUrl);

                    if(!habboAssetSwf)
                    {
                        console.log();
                        console.error(`Invalid SWF: ${ downloadUrl }`);

                        continue;
                    }

                    let nitroBundle: NitroBundle = null;

                    switch(type)
                    {
                        case 'furniture':
                            nitroBundle = await GenerateFurnitureBundle(habboAssetSwf);
                            break;
                    }

                    if(!nitroBundle)
                    {
                        console.log();
                        console.error(`Invalid SWF Bundle: ${ downloadUrl }`);

                        continue;
                    }

                    const saveFile = new File(`${ bundledTypeDirectory.path }/${ className }.nitro`);

                    await saveFile.writeData(await nitroBundle.toBufferAsync());

                    spinner.text = `Extracted SWF: ${ className }`;
                    spinner.render();
                }

                catch (error)
                {
                    console.log();
                    console.error(`Error Extracting: ${ name } - ${ error.message }`);
                }
            }
        }

        spinner.succeed(`SWF Extraction: Finished in ${ Date.now() - now }ms`);
    }

    public async bundleExtractedFromFolder(): Promise<void>
    {
        const now = Date.now();
        const spinner = ora('Preparing Bundler').start();
        const bundleBaseDirectory = await FileUtilities.getDirectory('./assets/extracted');
        const bundledBaseDirectory = await FileUtilities.getDirectory('./assets/bundled');

        for await (const type of ConverterUtilities.BUNDLE_TYPES)
        {
            const bundleTypeDirectory = await FileUtilities.getDirectory(`${ bundleBaseDirectory.path }/${ type }`);
            const bundledTypeDirectory = await FileUtilities.getDirectory(`${ bundledBaseDirectory.path }/${ type }`);
            const files = await bundleTypeDirectory.getFileList();

            for await (const name of files)
            {
                const [ className, extension, ...rest ] = name.split('.');

                try
                {
                    const bundleDirectory = new File(`${ bundleTypeDirectory.path }/${ name }`);

                    if(!await bundleDirectory.isDirectory()) continue;

                    spinner.text = `Bundling: ${ className }`;
                    spinner.render();

                    const nitroBundle = new NitroBundle();
                    const childFiles = await bundleDirectory.getFileList();

                    if(childFiles && childFiles.length)
                    {
                        for await (const childName of childFiles)
                        {
                            const childFile = new File(`${ bundleDirectory.path }/${ childName }`);

                            nitroBundle.addFile(childName, await childFile.getContentsAsBuffer());
                        }
                    }

                    if(nitroBundle.totalFiles)
                    {
                        const saveFile = new File(`${ bundledTypeDirectory.path }/${ className }.nitro`);

                        await saveFile.writeData(await nitroBundle.toBufferAsync());
                    }
                    else
                    {
                        console.log();
                        console.error(`Error Bundling: ${ name } - The bundle was empty`);

                        continue;
                    }

                    spinner.text = `Bundled: ${ name }`;
                    spinner.render();
                }

                catch (error)
                {
                    console.log();
                    console.error(`Error Bundling: ${ name } - ${ error.message }`);
                }
            }
        }

        spinner.succeed(`Bundler: Finished in ${ Date.now() - now }ms`);
    }
}
