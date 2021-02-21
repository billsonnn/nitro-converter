import 'reflect-metadata';
import { container } from 'tsyringe';
import { Configuration } from './common/config/Configuration';
import { EffectConverter } from './converters/effect/EffectConverter';
import { EffectMapConverter } from './converters/effectmap/EffectMapConverter';
import { FigureConverter } from './converters/figure/FigureConverter';
import { FigureMapConverter } from './converters/figuremap/FigureMapConverter';
import { FurnitureConverter } from './converters/furniture/FurnitureConverter';
import { FurnitureDataConverter } from './converters/furnituredata/FurnitureDataConverter';
import { PetConverter } from './converters/pet/PetConverter';
import { ProductDataConverter } from './converters/productdata/ProductDataConverter';

(async () =>
{
    const config = container.resolve(Configuration);
    await config.init();

    if(config.getBoolean('convert.figuremap'))
    {
        const figureMapConverter = container.resolve(FigureMapConverter);
        await figureMapConverter.convertAsync();
    }

    if(config.getBoolean('convert.effectmap'))
    {
        const effectMapConverter = container.resolve(EffectMapConverter);
        await effectMapConverter.convertAsync();
    }

    if(config.getBoolean('convert.furnidata'))
    {
        const furniDataConverter = container.resolve(FurnitureDataConverter);
        await furniDataConverter.convertAsync();
    }

    if(config.getBoolean('convert.productdata'))
    {
        const productDataConverter = container.resolve(ProductDataConverter);
        await productDataConverter.convertAsync();
    }

    if(config.getBoolean('convert.figure'))
    {
        const figureConverter = container.resolve(FigureConverter);
        await figureConverter.convertAsync();
    }

    if(config.getBoolean('convert.effect'))
    {
        const effectConverter = container.resolve(EffectConverter);
        await effectConverter.convertAsync();
    }

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
})();
