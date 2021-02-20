import 'reflect-metadata';
import { container } from 'tsyringe';
import { Configuration } from './common/config/Configuration';
import { EffectConverter } from './converters/effect/EffectConverter';
import { FigureConverter } from './converters/figure/FigureConverter';
import { FurnitureConverter } from './converters/furniture/FurnitureConverter';
import { PetConverter } from './converters/pet/PetConverter';

(async () =>
{
    const config = container.resolve(Configuration);
    await config.init();

    if(config.getBoolean('convert.figure'))
    {
        const figureConverter = container.resolve(FigureConverter);
        await figureConverter.convertAsync();
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

    if(config.getBoolean('convert.effect'))
    {
        const effectConverter = container.resolve(EffectConverter);
        await effectConverter.convertAsync();
    }
})();
