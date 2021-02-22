import 'reflect-metadata';
import { container } from 'tsyringe';
import { Configuration } from './common/config/Configuration';
import { IConverter } from './common/converters/IConverter';
import { EffectConverter } from './converters/effect/EffectConverter';
import { EffectMapConverter } from './converters/effectmap/EffectMapConverter';
import { ExternalTextsConverter } from './converters/externaltexts/ExternalTextsConverter';
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

    const converters = [
        FigureMapConverter,
        EffectMapConverter,
        FurnitureDataConverter,
        ProductDataConverter,
        ExternalTextsConverter,
        FigureConverter,
        EffectConverter,
        FurnitureConverter,
        PetConverter
    ];

    for(const converterClass of converters)
    {
        const converter = (container.resolve<any>(converterClass) as IConverter);

        await converter.convertAsync();
    }
})();
