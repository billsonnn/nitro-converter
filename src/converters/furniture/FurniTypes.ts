import {SpriteSheetType} from "../util/SpriteSheetTypes";

export interface FurniJson {
    type: string,
    name: string,
    visualizationType: string,
    logicType: string,
    maskType: string,
    credits: string,

    spritesheet: SpriteSheetType,

    dimensions: Dimensions,
    action: Action;
    directions: number[],
    assets: FurniAssets,
    visualizations: Visualization[]
}

export interface Visualization {
    layerCount: number,
    angle: number,
    size: number,

    layers: VisualizationLayers,
    directions: Directions,
    colors: Colors,
    animations: Animations,
    postures: Postures;
    gestures: Gestures
}

export interface Gestures {
    [key: string]: Gesture
}

export interface Gesture {
    id: string,
    animationId: number
}

export interface Postures {
    [key: string]: Posture
}

export interface Posture {
    id: string,
    animationId: number
}

export interface Offset {
    direction: number,
    x: number,
    y: number
}

export interface Frame {
    id: number,
    x: number,
    y: number,
    randomX: number,
    randomY: number,

    offsets: Offset[]
}

export interface Frames {
    [key: number]: Frame
}

export interface FrameSequence {
    loopCount: number,
    random: number,

    frames: Frames
}

export interface FrameSequences {
    [key: number]: FrameSequence
}

export interface AnimationLayer {
    id: number,
    loopCount: number,
    frameRepeat: number,
    random: number,

    frameSequences: FrameSequences
}

export interface AnimationLayers {
    [key: number]: AnimationLayer
}

export interface Animations {
    [key: number]: Animation
}

export interface Animation {
    id: number,
    transitionTo: number,
    transitionFrom: number,
    immediateChangeFrom: string,

    layers: AnimationLayers;
}

export interface ColorLayers {
    [key: number]: ColorLayer
}

export interface ColorLayer {
    id: number,
    color: number
}

export interface Colors {
    [key: number]: Color
}

export interface Color {
    id: number;
    layers: ColorLayers;
}

export interface Directions {
    [key: number]: Direction
}

export interface Direction {
    id: number;
    layers: VisualizationLayers;
}

export interface VisualizationLayers {
    [key: number]: Layer
}

export interface Layer {
    id: number,
    alpha: number,
    x: number,
    y: number,
    z: number,
    ink: string,
    tag: string,
    ignoreMouse: boolean
}

export interface Action {
    link: string,
    startState: number
}

export interface Dimensions {
    x: number,
    y: number,
    z: number
}

export interface FurniAssets {
    [key: string]: FurniAsset
}

export interface FurniAsset {
    source: string,
    x: number,
    y: number,
    flipH: boolean
}