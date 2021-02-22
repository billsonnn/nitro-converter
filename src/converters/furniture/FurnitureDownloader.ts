import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { IFurnitureData } from '../../mapping/json';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import File from '../../utils/File';
import { FileUtilities } from '../../utils/FileUtilities';
import { Logger } from '../../utils/Logger';

@singleton()
export class FurnitureDownloader
{
    constructor(
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {}

    public async download(directory: File, callback: (habboAssetSwf: HabboAssetSWF, className: string) => Promise<void>): Promise<void>
    {
        const furniData = await this.parseFurniData();

        if(!furniData) throw new Error('invalid_furnidata');

        const classNames: string[] = [];

        if(furniData.roomitemtypes !== undefined)
        {
            if(furniData.roomitemtypes.furnitype !== undefined)
            {
                for(const furniType of furniData.roomitemtypes.furnitype)
                {
                    const className = furniType.classname.split('*')[0];
                    const revision = furniType.revision;

                    const existingFile = new File(directory.path + '/' + className + '.nitro');

                    if(existingFile.isDirectory) continue;

                    if(classNames.indexOf(className) >= 0) continue;

                    classNames.push(className);

                    try
                    {
                        await this.extractFurniture(revision, className, callback);
                    }

                    catch (error)
                    {
                        console.log();
                        console.error(`Error parsing ${ className }: ` + error.message);
                    }
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

                    if(existingFile.isDirectory) continue;

                    if(classNames.indexOf(className) >= 0) continue;

                    classNames.push(className);

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
                }
            }
        }
    }

    public async parseFurniData(): Promise<IFurnitureData>
    {
        const url = this._configuration.getValue('furnidata.load.url');

        if(!url || !url.length) return null;

        const content = await FileUtilities.readFileAsString(url);

        if(!content || !content.length) return null;

        return (JSON.parse(content) as IFurnitureData);
    }

    public async extractFurniture(revision: number, className: string, callback: (habboAssetSwf: HabboAssetSWF, className: string) => Promise<void>): Promise<void>
    {
        let url = this._configuration.getValue('dynamic.download.furniture.url');

        if(!url || !url.length) return;

        url = url.replace('%revision%', revision.toString());
        url = url.replace('%className%', className);

        const buffer = await FileUtilities.readFileAsBuffer(url);

        if(!buffer) return;

        const newHabboAssetSWF = new HabboAssetSWF(buffer);

        await newHabboAssetSWF.setupAsync();

        await callback(newHabboAssetSWF, className);
    }
}
