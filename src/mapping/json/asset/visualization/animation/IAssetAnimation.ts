import { IAssetAnimationLayer } from './IAssetAnimationLayer';

export interface IAssetAnimation
{
    transitionTo?: number;
    transitionFrom?: number;
    immediateChangeFrom?: string;
    layers?: { [index: string]: IAssetAnimationLayer };
}
