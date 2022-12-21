import { GenerateSpriteSheet } from './GenerateSpritesheet';
import { HabboAssetSWF } from './HabboAssetSWF';
import { SWFUtilities } from './SWFUtilities';

export const GenerateNitroBundleFromSwf = async (habboAssetSWF: HabboAssetSWF, assetType: string = null) =>
{
    if (!habboAssetSWF) return null;

    const spriteBundle = await GenerateSpriteSheet(habboAssetSWF);
    const assetData = await SWFUtilities.mapXML2JSON(habboAssetSWF, assetType);

    let assetName = habboAssetSWF.getDocumentClass();

    if (assetName === 'HabboRoomContent') assetName = 'room';

    assetData.name = assetName;

    return SWFUtilities.createNitroBundle(assetName, assetData, spriteBundle);
};
