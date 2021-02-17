import { IAssetAnimationSequence } from './IAssetAnimationSequence';

export interface IAssetAnimationLayer
{
    loopCount?: number;
    frameRepeat?: number;
    random?: number;
    frameSequences?: { [index: string]: IAssetAnimationSequence };
}
