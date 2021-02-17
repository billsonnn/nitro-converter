import 'reflect-metadata';
import { container } from 'tsyringe';
import { BundleProvider } from './common/bundle/BundleProvider';
import { Configuration } from './common/config/Configuration';
import { FurnitureConverter } from './converters/furniture/FurnitureConverter';
import { PetConverter } from './converters/pet/PetConverter';
import { Mapper } from './mapping/mappers/asset/Mapper';

(async () =>
{
    const config = container.resolve(Configuration);
    await config.init();

    const prohibitedSizes = (config.getValue('prohibited.sizes') || '').split(',');
    const prohibitedSizesAsset = [];

    for(const prohibitedSize of prohibitedSizes) prohibitedSizesAsset.push('_' + prohibitedSize + '_');

    Mapper.PROHIBITED_SIZES = prohibitedSizes;
    BundleProvider.PROHIBITED_SIZES = prohibitedSizesAsset;

    // if(config.getBoolean('convert.figure'))
    // {
    //     const figureConverter = container.resolve(FigureConverter);
    //     await figureConverter.convertAsync();
    // }

    if(config.getBoolean('convert.furniture'))
    {
        const furnitureConverter = container.resolve(FurnitureConverter);
        await furnitureConverter.convertAsync();
    }

    if(config.getBoolean('convert.pet'))
    {
        const petConverter = container.resolve(PetConverter);
        await petConverter.convertAsync();
    }

    // if(config.getBoolean('convert.effect'))
    // {
    //     const effectConverter = container.resolve(EffectConverter);
    //     await effectConverter.convertAsync();
    // }

    console.log('finished!');
})();
