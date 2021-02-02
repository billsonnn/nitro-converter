import {SpriteSheetType} from "./util/SpriteSheetTypes";

export default interface ArchiveType {
    spriteSheetType: SpriteSheetType,
    imageData: {
        name: string,
        buffer: Buffer
    }
}