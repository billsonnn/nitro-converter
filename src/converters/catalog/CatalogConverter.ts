import { createWriteStream } from 'fs';
import * as ora from 'ora';
import { singleton } from 'tsyringe';
import { Configuration } from '../../common/config/Configuration';
import { SWFConverter } from '../../common/converters/SWFConverter';
import File from '../../utils/File';
import { Logger } from '../../utils/Logger';
import { FurnitureConverter } from '../furniture/FurnitureConverter';
import { FurnitureDataConverter } from '../furnituredata/FurnitureDataConverter';

@singleton()
export class CatalogConverter extends SWFConverter
{
    constructor(
        private readonly _furniDataConverter: FurnitureDataConverter,
        private readonly _furniConverter: FurnitureConverter,
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        if(!this._configuration.getBoolean('convert.catalog')) return;

        const now = Date.now();

        const spinner = ora('Building catalog').start();

        const directory = this.getDirectory();

        //await unlink(directory.path + '/catalog.txt');

        const file = createWriteStream(directory.path + '/catalog.txt', {
            flags: 'a'
        });

        file.write('INSERT INTO `furniture_definitions` (`id`, `sprite_id`, `public_name`, `product_name`, `type`, `logic`, `total_states`, `x`, `y`, `z`, `can_stack`, `can_walk`, `can_sit`, `can_lay`, `can_recycle`, `can_trade`, `can_group`, `can_sell`, `extra_data`, `date_created`, `date_updated`) VALUES');

        try
        {
            const furnitureData = this._furniDataConverter.furnitureData;

            const floorItems = furnitureData.roomitemtypes;

            if(floorItems && floorItems.furnitype)
            {
                for(const furniture of floorItems.furnitype)
                {
                    const assetData = this._furniConverter.assets.get(furniture.classname.split('*')[0]);

                    if(!assetData) continue;

                    let totalStates = 0;

                    if(assetData.visualizations)
                    {
                        for(const visualization of assetData.visualizations)
                        {
                            if(visualization.size !== 64) continue;

                            const animations = visualization.animations;

                            for(const animationKey in animations)
                            {
                                const animation = animations[animationKey];

                                if((animation.transitionTo !== undefined) || (animation.transitionFrom !== undefined)) continue;

                                totalStates++;
                            }
                        }

                        file.write(`(NULL, ${ furniture.id }, "${ furniture.name }", "${ furniture.classname }", 's', 'default', ${ totalStates }, ${ isNaN(assetData.dimensions.x) ? 0 : assetData.dimensions.x }, ${ isNaN(assetData.dimensions.y) ? 0 : assetData.dimensions.y }, ${ isNaN(assetData.dimensions.z) ? 0 : assetData.dimensions.z }, 0, ${ furniture.canstandon ? 1 : 0 }, ${ furniture.cansiton ? 1 : 0 }, ${ furniture.canlayon ? 1 : 0 }, 1, 1, 1, 1, NULL, '2021-03-21 22:58:36.000000', '2021-03-21 22:58:45.000000'), `);
                    }
                }
            }

            const wallItems = furnitureData.wallitemtypes;

            if(wallItems && wallItems.furnitype)
            {
                for(const furniture of wallItems.furnitype)
                {
                    const assetData = this._furniConverter.assets.get(furniture.classname.split('*')[0]);

                    if(!assetData) continue;

                    let totalStates = 0;

                    for(const visualization of assetData.visualizations)
                    {
                        if(visualization.size !== 64) continue;

                        const animations = visualization.animations;

                        for(const animationKey in animations)
                        {
                            const animation = animations[animationKey];

                            if((animation.transitionTo !== undefined) || (animation.transitionFrom !== undefined)) continue;

                            totalStates++;
                        }
                    }

                    file.write(`(NULL, ${ furniture.id }, "${ furniture.name }", "${ furniture.classname }", 'i', 'default', ${ totalStates }, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, NULL, '2021-03-21 22:58:36.000000', '2021-03-21 22:58:45.000000'), `);
                }
            }

            file.end();

            spinner.succeed(`Catalog finished in ${ Date.now() - now }ms`);
        }

        catch (error)
        {
            spinner.fail('Catalog failed: ' + error.message);
        }
    }

    private getDirectory(): File
    {
        const baseFolder = new File(this._configuration.getValue('output.folder'));

        if(!baseFolder.isDirectory()) baseFolder.mkdirs();

        const gameDataFolder = new File(baseFolder.path + 'catalog');

        if(!gameDataFolder.isDirectory()) gameDataFolder.mkdirs();

        return gameDataFolder;
    }
}
