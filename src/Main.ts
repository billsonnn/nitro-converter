import 'reflect-metadata';
import { container } from 'tsyringe';
import { Configuration } from './common/config/Configuration';
import { IConverter } from './common/converters/IConverter';
import { EffectConverter } from './converters/EffectConverter';
import { EffectMapConverter } from './converters/EffectMapConverter';
import { ExternalTextsConverter } from './converters/ExternalTextsConverter';
import { FigureConverter } from './converters/FigureConverter';
import { FigureDataConverter } from './converters/FigureDataConverter';
import { FigureMapConverter } from './converters/FigureMapConverter';
import { FurnitureConverter } from './converters/FurnitureConverter';
import { FurnitureDataConverter } from './converters/FurnitureDataConverter';
import { OldAssetConverter } from './converters/OldAssetConverter';
import { PetConverter } from './converters/PetConverter';
import { ProductDataConverter } from './converters/ProductDataConverter';

(async () =>
{
    checkNodeVersion();

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
        PetConverter,
        OldAssetConverter
    ];

    const [ arg1, arg2, ...rest ] = process.argv;

    for(const converterClass of converters)
    {
        const converter = (container.resolve<any>(converterClass) as IConverter);

        await converter.convertAsync(rest);
    }
})();

function checkNodeVersion()
{
    const version = process.version.replace('v', '');
    const major = version.split('.')[0];
    if(parseInt(major) < 14)
    {
        throw new Error('Invalid node version: ' + version + ' please use >= 14');
    }
}
