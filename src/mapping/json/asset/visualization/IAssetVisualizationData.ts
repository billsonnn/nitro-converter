import { IAssetAnimation } from './animation/IAssetAnimation';
import { IAssetColor } from './color/IAssetColor';
import { IAssetGesture } from './gestures/IAssetGesture';
import { IAssetVisualizationDirection } from './IAssetVisualizationDirection';
import { IAssetVisualizationLayer } from './IAssetVisualizationLayer';
import { IAssetPosture } from './postures/IAssetPosture';

export interface IAssetVisualizationData
{
    size?: number;
    layerCount?: number;
    angle?: number;
    layers?: { [index: string]: IAssetVisualizationLayer };
    colors?: { [index: string]: IAssetColor };
    directions?: { [index: string]: IAssetVisualizationDirection };
    animations?: { [index: string]: IAssetAnimation };
    postures?: { [index: string]: IAssetPosture };
    gestures?: { [index: string]: IAssetGesture };
}
