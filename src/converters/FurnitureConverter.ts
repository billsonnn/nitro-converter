import { writeFile } from 'fs/promises';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { BundleProvider } from '../common/bundle/BundleProvider';
import { Configuration } from '../common/config/Configuration';
import { SWFConverter } from '../common/converters/SWFConverter';
import { SWFDownloader } from '../common/SWFDownloader';
import { IAssetData } from '../mapping/json';
import { File } from '../utils/File';
import { FileUtilities } from '../utils/FileUtilities';
import { FurnitureDataConverter } from './FurnitureDataConverter';

@singleton()
export class FurnitureConverter
{
    public assets: Map<string, IAssetData> = new Map();

    constructor(
        private readonly _furniDataConverter: FurnitureDataConverter,
        private readonly _configuration: Configuration)
    {}

    public async convertAsync(args: string[] = []): Promise<void>
    {
        if(!this._configuration.getBoolean('convert.furniture')) return;

        const now = Date.now();
        const spinner = ora('Preparing Furniture').start();
        const baseUrl = this._configuration.getValue('dynamic.download.furniture.url');
        const furniData = this._furniDataConverter.furnitureData;
        const directory = FileUtilities.getDirectory(this._configuration.getValue('output.folder'), 'furniture');
        const classNames: string[] = [];
        const revisions: number[] = [];

        if(furniData.roomitemtypes)
        {
            if(furniData.roomitemtypes.furnitype)
            {
                for(const furniType of furniData.roomitemtypes.furnitype)
                {
                    const className = furniType.classname.split('*')[0];
                    const revision = furniType.revision;

                    if(classNames.indexOf(className) >= 0) continue;

                    classNames.push(className);
                    revisions.push(revision);
                }
            }
        }

        if(furniData.wallitemtypes)
        {
            if(furniData.wallitemtypes.furnitype)
            {
                for(const furniType of furniData.wallitemtypes.furnitype)
                {
                    const className = furniType.classname.split('*')[0];
                    const revision = furniType.revision;

                    if(classNames.indexOf(className) >= 0) continue;

                    classNames.push(className);
                    revisions.push(revision);
                }
            }
        }

        for(let i = 0; i < classNames.length; i++)
        {
            const className = classNames[i];
            const revision = revisions[i];

            try
            {
                const path = new File(directory.path + '/' + className + '.nitro');

                if(path.exists()) continue;

                const habboAssetSWF = await SWFDownloader.download(baseUrl, className, revision);

                if(!habboAssetSWF)
                {
                    spinner.text = 'Couldnt convert furni: ' + className;

                    spinner.render();

                    continue;
                }
                else
                {
                    spinner.text = 'Couldnt convert furni: ' + className;

                    spinner.render();
                }

                const spriteBundle = await BundleProvider.generateSpriteSheet(habboAssetSWF);
                const assetData = await SWFConverter.mapXML2JSON(habboAssetSWF, 'furniture');
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
        spinner.succeed(`Furniture finished in ${ Date.now() - now }ms`);
    }
}
