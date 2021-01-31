import {SpriteSheetType} from "./SpriteSheetTypes";

const fs = require('fs').promises;
let {packAsync} = require("free-tex-packer-core");

import HabboAssetSWF from "../../swf/HabboAssetSWF";
import SymbolClassTag from "../../swf/tags/SymbolClassTag";
import ImageTag from "../../swf/tags/ImageTag";

export default class SpriteSheetConverter {
    public static imageSource: Map<String, String> = new Map<String, String>();

    public async generateSpriteSheet(habboAssetSWF: HabboAssetSWF, outputFolder: string, type: string): Promise<SpriteSheetType | null> {
        const tagList: Array<SymbolClassTag> = habboAssetSWF.symbolTags();
        const names: Array<string> = new Array<string>();
        const tags: Array<number> = new Array<number>();
        for (const tag of tagList) {
            names.push(...tag.names);
            tags.push(...tag.tags);
        }

        const images: Array<{ path: String, contents: Buffer }> = new Array<{ path: String, contents: Buffer }>();

        const imageTags: Array<ImageTag> = habboAssetSWF.imageTags();
        for (const imageTag of imageTags) {
            if (tags.includes(imageTag.characterID)) {
                for (let i = 0; i < tags.length; i++) {
                    if (tags[i] == imageTag.characterID) {
                        if (
                            (names[i].includes("_64_") && type === "furniture") ||
                            (names[i].includes("_icon_") && type === "furniture") ||
                            (names[i].includes("_h_") && (type === "figure" || type === "effect")) ||
                            (names[i].includes("_64_") && type === "pet")) {

                            if (names[i] !== imageTag.className) {
                                SpriteSheetConverter.imageSource.set(names[i].substring(habboAssetSWF.getDocumentClass().length + 1), imageTag.className.substring(habboAssetSWF.getDocumentClass().length + 1));
                                if ((imageTag.className.includes("_32_") && type === "furniture") ||
                                    (imageTag.className.includes("_sh_") && (type === "figure" || type === "effect")) ||
                                    (imageTag.className.includes("_32_") && type === "pet")) {
                                    images.push({
                                        path: imageTag.className,
                                        contents: imageTag.imgData
                                    });
                                }
                            }
                        }
                    }
                }
            }

            if ((imageTag.className.includes("_64_") && type === "furniture") ||
                (imageTag.className.includes("_icon_") && type === "furniture") ||
                (imageTag.className.includes("_h_") && (type === "figure" || type === "effect")) ||
                (imageTag.className.includes("_64_") && type === "pet")) {
                images.push({
                    path: imageTag.className,
                    contents: imageTag.imgData
                });
            }

        }

        if (images.length === 0) {
            return null;
        }

        return await this.packImages(habboAssetSWF.getDocumentClass(), outputFolder + "/", images);
    }

    async packImages(documentClass: string, outputFolder: string, images: Array<{ path: String, contents: Buffer }>): Promise<SpriteSheetType | null> {
        let options = {
            textureName: documentClass,
            width: 1024,
            height: 1024,
            fixedSize: false,
            allowRotation: true,
            detectIdentical: true,
            allowTrim: true,
            exporter: "Pixi"
        };

        let spriteSheetType: SpriteSheetType | null = null;
        let base64 = "";
        try {
            const files = await packAsync(images, options);
            for (let item of files) {
                if (item.name.endsWith(".json")) {
                    spriteSheetType = JSON.parse(item.buffer.toString('utf8'));
                } else {
                    base64 = item.buffer.toString("base64");
                    //await fs.writeFile(outputFolder + item.name, item.buffer);
                }
            }

            if (spriteSheetType === null) throw new Error("Failed to parse SpriteSheet. " + images[0].path);
        } catch (error) {
            console.log("Image Packing Error: ");
            console.log(error);
        }

        if (spriteSheetType !== null) spriteSheetType.meta.image = base64;
        return spriteSheetType;
    }
}