import { GenerateSpriteSheet } from './GenerateSpritesheet';
import { HabboAssetSWF } from './HabboAssetSWF';
import { SWFUtilities } from './SWFUtilities';

export const GenerateFurnitureBundle = async (habboAssetSWF: HabboAssetSWF) =>
{
    if(!habboAssetSWF) return null;

    const spriteBundle = await GenerateSpriteSheet(habboAssetSWF);
    const assetData = await SWFUtilities.mapXML2JSON(habboAssetSWF, 'furniture');
    const nitroBundle = SWFUtilities.createNitroBundle(habboAssetSWF.getDocumentClass(), assetData, spriteBundle);

    return nitroBundle;
};
