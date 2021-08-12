import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { IFurnitureData } from '../../mapping/json';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import File from '../../utils/File';
import { FileUtilities } from '../../utils/FileUtilities';
import { Logger } from '../../utils/Logger';
import { FurnitureDataConverter } from '../furnituredata/FurnitureDataConverter';

@singleton()
export class FurnitureDownloader
{
    private _totalItems: number = 0;
    private _totalFinished: number = 0;

    constructor(
        private readonly _furnitureDataConverter: FurnitureDataConverter,
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {}

    public async download(directory: File, callback: (habboAssetSwf: HabboAssetSWF, className: string) => Promise<void>): Promise<void>
    {
        await this._furnitureDataConverter.convertAsync();

        const furniData = await this.parseFurniData();

        if(!furniData) throw new Error('invalid_furnidata');

        const classNames: string[] = [];
        const revisions: number[] = [];

        if(furniData.roomitemtypes !== undefined)
        {
            if(furniData.roomitemtypes.furnitype !== undefined)
            {
                for(const furniType of furniData.roomitemtypes.furnitype)
                {
                    const className = furniType.classname.split('*')[0];
                    const revision = furniType.revision;

                    const existingFile = new File(directory.path + '/' + className + '.nitro');

                    if(existingFile.exists()) continue;

                    if(classNames.indexOf(className) >= 0) continue;

                    classNames.push(className);
                    revisions.push(revision);
                }
            }
        }

        if(furniData.wallitemtypes !== undefined)
        {
            if(furniData.wallitemtypes.furnitype !== undefined)
            {
                for(const furniType of furniData.wallitemtypes.furnitype)
                {
                    const className = furniType.classname.split('*')[0];
                    const revision = furniType.revision;

                    const existingFile = new File(directory.path + '/' + className + '.nitro');

                    if(existingFile.exists()) continue;

                    if(classNames.indexOf(className) >= 0) continue;

                    classNames.push(className);
                    revisions.push(revision);
                }
            }
        }

        this._totalItems = classNames.length;

        this._totalFinished = 0;

        while(this._totalFinished < this._totalItems)
        {
            const className = classNames[this._totalFinished];
            const revision = revisions[this._totalFinished];

            try
            {
                await this.extractFurniture(revision, className, callback);
            }

            catch (error)
            {
                console.log();
                console.error(`Error parsing ${ className }: ` + error.message);

                this._logger.logError(`Error parsing ${ className }: ` + error.message);
            }

            this._totalFinished++;
        }
    }

    public async parseFurniData(): Promise<IFurnitureData>
    {
        const url = this._configuration.getValue('furnidata.load.url');

        if(!url || !url.length) return null;

        const logDownloads = this._configuration.getBoolean('misc.log_download_urls');

        if(logDownloads) console.log(`<Downloader> Downloading furniture data from ${url}`);

        const content = await FileUtilities.readFileAsString(url);

        if(!content || !content.length) return null;

        return (JSON.parse(content) as IFurnitureData);
    }

    public async extractFurniture(revision: number, className: string, callback: (habboAssetSwf: HabboAssetSWF, className: string) => Promise<void>): Promise<void>
    {
        let url = this._configuration.getValue('dynamic.download.furniture.url');

        if(!url || !url.length) return;

        //url = url.replace('%revision%', revision.toString());
        url = url.replace('%className%', className);

        const logDownloads = this._configuration.getBoolean('misc.log_download_urls');

        if(logDownloads) console.log(`<Downloader> Downloading furniture from ${url}`);

        const buffer = await FileUtilities.readFileAsBuffer(url);

        if(!buffer) return;

        const newHabboAssetSWF = new HabboAssetSWF(buffer);

        await newHabboAssetSWF.setupAsync();

        await callback(newHabboAssetSWF, className);
    }

    public get totalItems(): number
    {
        return this._totalItems;
    }

    public get totalFinished(): number
    {
        return this._totalFinished;
    }
}
