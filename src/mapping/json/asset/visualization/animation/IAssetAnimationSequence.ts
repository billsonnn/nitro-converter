import { IAssetAnimationSequenceFrame } from './IAssetAnimationSequenceFrame';

export interface IAssetAnimationSequence
{
    loopCount?: number;
    random?: number;
    frames?: { [index: string]: IAssetAnimationSequenceFrame };
}
