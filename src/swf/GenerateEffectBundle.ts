import { GenerateSpriteSheet } from './GenerateSpritesheet';
import { HabboAssetSWF } from './HabboAssetSWF';
import { SWFUtilities } from './SWFUtilities';

export const GenerateEffectBundle = async (habboAssetSWF: HabboAssetSWF, className: string, effectType: string) =>
{
    if(!habboAssetSWF) return null;

    const spriteBundle = await GenerateSpriteSheet(habboAssetSWF);
    const assetData = await SWFUtilities.mapXML2JSON(habboAssetSWF, className);

    if(assetData)
    {
        assetData.name = className;
        assetData.type = effectType;
    }

    const nitroBundle = SWFUtilities.createNitroBundle(habboAssetSWF.getDocumentClass(), assetData, spriteBundle);

    return nitroBundle;
};
