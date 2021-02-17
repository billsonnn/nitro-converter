import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { IFurnitureData } from '../../mapping/json';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import File from '../../utils/File';
import { FileUtilities } from '../../utils/FileUtilities';
import Logger from '../../utils/Logger';

@singleton()
export class FurnitureDownloader
{
    constructor(
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {}

    public async download(callback: (habboAssetSwf: HabboAssetSWF, className: string) => Promise<void>): Promise<void>
    {
        try
        {
            let count = 0;

            const furniData = await this.parseFurniData();
            const classNames: string[] = [];

            const outputFolder = new File(this._configuration.getValue('output.folder.furniture'));

            if(!outputFolder.isDirectory()) outputFolder.mkdirs();

            if(furniData.roomitemtypes !== undefined)
            {
                if(furniData.roomitemtypes.furnitype !== undefined)
                {
                    for(const furniType of furniData.roomitemtypes.furnitype)
                    {
                        const className = furniType.classname.split('*')[0];
                        const revision = furniType.revision;

                        if(count === 3) return;

                        if(classNames.indexOf(className) >= 0) continue;

                        classNames.push(className);

                        try
                        {
                            await this.extractFurniture(revision, className, callback);

                            count ++;
                        }

                        catch(error)
                        {
                            console.log();
                            console.error(error);
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

                        if(classNames.indexOf(className) >= 0) continue;

                        classNames.push(className);

                        try
                        {
                            await this.extractFurniture(revision, className, callback);
                        }

                        catch(error)
                        {
                            console.log();
                            console.error(error);
                        }
                    }
                }
            }
        }

        catch (error)
        {
            console.log();
            console.error(error);
        }
    }

    public async parseFurniData(): Promise<IFurnitureData>
    {
        const url = this._configuration.getValue('furnidata.url');
 
        if(!url || !url.length) return null;

        try
        {
            const content = await FileUtilities.readFileAsString(url);

            if(!content || !content.length) return null;

            return (JSON.parse(content) as IFurnitureData);
        }

        catch(error)
        {
            console.log();
            console.error(error);
        }
    }

    public async extractFurniture(revision: number, className: string, callback: (habboAssetSwf: HabboAssetSWF, className: string) => Promise<void>): Promise<void>
    {
        let url = this._configuration.getValue('dynamic.download.url.furniture');

        if(!url || !url.length) return;

        url = url.replace('%revision%', revision.toString());
        url = url.replace('%className%', className);

        try
        {
            const buffer = await FileUtilities.readFileAsBuffer(url);

            if(!buffer) return;
            
            const newHabboAssetSWF = new HabboAssetSWF(buffer);

            await newHabboAssetSWF.setupAsync();

            await callback(newHabboAssetSWF, className);
        }

        catch (error)
        {
            console.log();
            console.error(error);
        }
    }
}
