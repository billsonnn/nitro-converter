import 'reflect-metadata';
import { container } from 'tsyringe';
import { Configuration } from './common/config/Configuration';
import { IConverter } from './common/converters/IConverter';
import { ConverterUtilities } from './converters/ConverterUtilities';
import { EffectConverter } from './converters/EffectConverter';
import { EffectMapConverter } from './converters/EffectMapConverter';
import { ExternalTextsConverter } from './converters/ExternalTextsConverter';
import { FigureConverter } from './converters/FigureConverter';
import { FigureDataConverter } from './converters/FigureDataConverter';
import { FigureMapConverter } from './converters/FigureMapConverter';
import { FurnitureConverter } from './converters/FurnitureConverter';
import { FurnitureDataConverter } from './converters/FurnitureDataConverter';
import { PetConverter } from './converters/PetConverter';
import { ProductDataConverter } from './converters/ProductDataConverter';

(async () =>
{
    const config = container.resolve(Configuration);
    await config.init();

    const converters = [
        FurnitureDataConverter,
        FigureDataConverter,
        ProductDataConverter,
        ExternalTextsConverter,
        EffectMapConverter,
        FigureMapConverter,
        FurnitureConverter,
        FigureConverter,
        EffectConverter,
        PetConverter
    ];

    const bundle = (process.argv.indexOf('--bundle') >= 0);
    const extract = (process.argv.indexOf('--extract') >= 0);
    const convertSwf = (process.argv.indexOf('--convert-swf') >= 0);
    const skip = (bundle || extract || convertSwf);

    if(skip)
    {
        const extractor = container.resolve(ConverterUtilities);

        bundle && await extractor.bundleExtractedFromFolder();
        extract && await extractor.extractNitroFromFolder();
        convertSwf && await extractor.convertSwfFromFolder();

        process.exit();
    }

    for(const converterClass of converters)
    {
        const converter = (container.resolve<any>(converterClass) as IConverter);

        await converter.convertAsync();
    }

    process.kill(process.pid, 'SIGTERM');
})();
