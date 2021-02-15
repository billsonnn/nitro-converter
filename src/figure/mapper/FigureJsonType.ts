import {SpriteSheetType} from "../../bundle/BundleTypes";

export interface FigureJson {
    type: string,
    name: string,
    spritesheet: SpriteSheetType,
    assets: FigureAssets
}

export interface FigureAssets {
    [key: string]: FigureAsset
}

export interface FigureAsset {
    name: string,
    source: string,
    x: number,
    y: number,
    flipH: boolean
}