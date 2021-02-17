import { IAssetAnimationSequenceFrameOffset } from './IAssetAnimationSequenceFrameOffset';

export interface IAssetAnimationSequenceFrame
{
    id?: number;
    x?: number;
    y?: number;
    randomX?: number;
    randomY?: number;
    offsets?: { [index: string]: IAssetAnimationSequenceFrameOffset };
}
