import { IAssetAnimation } from './animation';
import { IAsset } from './IAsset';
import { IAssetAlias } from './IAssetAlias';
import { IAssetDimension } from './IAssetDimension';
import { IAssetPalette } from './IAssetPalette';
import { ISoundSample } from './ISoundSample';
import { ISpritesheetData } from './spritesheet';
import { IAssetVisualizationData } from './visualization';

export interface IAssetData {
    type?: string;
    name?: string;
    visualizationType?: string;
    logicType?: string;
    maskType?: string;
    credits?: string;
    soundSample?: ISoundSample;
    action?: { link?: string, startState?: number };
    spritesheet?: ISpritesheetData;
    dimensions?: IAssetDimension;
    directions?: number[];
    assets?: { [index: string]: IAsset };
    aliases?: { [index: string]: IAssetAlias };
    animations?: { [index: string]: IAssetAnimation };
    palettes?: { [index: string]: IAssetPalette };
    visualizations?: IAssetVisualizationData[];
}
