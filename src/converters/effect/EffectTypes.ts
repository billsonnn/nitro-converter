import {SpriteSheetType} from "../util/SpriteSheetTypes";

export interface EffectJson {
    type: string,
    name: string,
    spritesheet: SpriteSheetType,

    assets: AssetsJSON,
    aliases: Aliases,
    animations: Animations
}

export interface Animations {
    [key: string]: Animation
}

export interface Animation {
    name: string,
    desc: string,
    resetOnToggle: boolean,

    directions: Array<DirectionOffset>,
    shadows: Array<Shadow>,
    adds: Array<Add>,
    removes: Array<Remove>,
    sprites: Array<Sprite>,
    frames: Array<Frame>,
    avatars: Array<Avatar>,
    overrides: Array<Override>
}

export interface Override {
    name: string,
    override: string,

    frames: Array<Frame>;
}

export interface Avatar {
    ink: number,
    foreground: string,
    background: string
}

export interface Frame {
    repeats: number,

    fxs: Array<Fx>,
    bodyparts: Array<Bodypart>
}

export interface Bodypart {
    id: string,
    frame: number,
    dx: number,
    dy: number,
    dz: number,
    dd: number,
    action: string,
    base: string,

    items: Array<Item>
}

export interface Item {
    id: string,
    base: string
}

export interface Fx {
    id: string,
    frame: number,
    dx: number,
    dy: number,
    dz: number,
    dd: number,
    action: string
}

export interface Sprite {
    id: string,
    member: string,
    directions: number,
    staticY: number,
    ink: number,

    directionList: Array<Direction>;
}

export interface Direction {
    id: number,
    dx: number,
    dy: number,
    dz: number,
}

export interface Remove {
    id: string
}

export interface Add {
    id: string,
    align: string,
    blend: string,
    ink: number,
    base: string
}

export interface Shadow {
    id: string
}

export interface DirectionOffset {
    offset: number
}

export interface Aliases {
    [key: string]: Alias
}

export interface Alias {
    link: string,
    fliph: number,
    flipv: number
}

export interface AssetsJSON {
    [key: string]: AssetJSON;
}

export interface AssetJSON {
    source: string,
    x: number,
    y: number,
}