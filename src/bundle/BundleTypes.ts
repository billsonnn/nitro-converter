export default interface BundleTypes {
    spriteSheetType: SpriteSheetType,
    imageData: {
        name: string,
        buffer: Buffer
    }
}

export interface SpriteSheetType {
    frames: SpriteSheetFrames,
    meta: SpriteSheetMeta
}

export interface SpriteSheetFrames {
    [key: string]: SpriteSheetFrame
}

export interface SpriteSheetFrame {
    frame: SpriteSheetFrameDimensions,
    rotated: boolean,
    trimmed: boolean,
    spriteSourceSize: SpriteSourceSize
    sourceSize: SourceSize,
    pivot: FramePivot
}

export interface FramePivot {
    x: number,
    y: number
}

export interface SourceSize {
    w: number,
    h: number
}

export interface SpriteSourceSize {
    x: number,
    y: number,
    w: number,
    h: number
}

export interface SpriteSheetFrameDimensions {
    x: number,
    y: number,
    w: number,
    h: number
}

export interface SpriteSheetMeta {
    app: string,
    version: string,
    image: string,
    format: string,
    size: SpriteSheetSize,
    scale: number
}

export interface SpriteSheetSize {
    w: number,
    h: number
}