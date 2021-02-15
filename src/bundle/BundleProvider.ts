import HabboAssetSWF from "../swf/HabboAssetSWF";
import BundleTypes from "./BundleTypes";
import SymbolClassTag from "../swf/tags/SymbolClassTag";
import ImageTag from "../swf/tags/ImageTag";
import {singleton} from "tsyringe";

const {packAsync} = require('free-tex-packer-core');

@singleton()
export default class BundleProvider {
    public static imageSource: Map<string, string> = new Map<string, string>();

    public async generateSpriteSheet(habboAssetSWF: HabboAssetSWF, outputFolder: string, type: string): Promise<BundleTypes | null> {
        const tagList: Array<SymbolClassTag> = habboAssetSWF.symbolTags();
        const names: Array<string> = new Array<string>();
        const tags: Array<number> = new Array<number>();
        for (const tag of tagList) {
            names.push(...tag.names);
            tags.push(...tag.tags);
        }

        const images: Array<{ path: string, contents: Buffer }> = new Array<{ path: string, contents: Buffer }>();

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
                                BundleProvider.imageSource.set(names[i].substring(habboAssetSWF.getDocumentClass().length + 1), imageTag.className.substring(habboAssetSWF.getDocumentClass().length + 1));
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
                (imageTag.className.includes("_1_") && type === "furniture") ||
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

    async packImages(documentClass: string, outputFolder: string, images: Array<{ path: string, contents: Buffer }>): Promise<BundleTypes | null> {
        let options = {
            textureName: documentClass,
            width: 3072,
            height: 2048,
            fixedSize: false,
            allowRotation: true,
            detectIdentical: true,
            allowTrim: true,
            exporter: "Pixi"
        };

        const archiveType: BundleTypes = {} as any;
        const imageData: {
            name: string,
            buffer: Buffer
        } = {} as any;

        try {
            const files = await packAsync(images, options);
            for (let item of files) {
                if (item.name.endsWith(".json")) {
                    archiveType.spriteSheetType = JSON.parse(item.buffer.toString('utf8'));
                } else {
                    imageData.buffer = item.buffer;
                    imageData.name = item.name;
                }
            }

            if (archiveType.spriteSheetType === null) throw new Error("Failed to parse SpriteSheet. " + images[0].path);
        } catch (error) {
            console.log("Image Packing Error: ");
            console.log(error);
        }

        if (archiveType.spriteSheetType !== null) {
            archiveType.spriteSheetType.meta.image = imageData.name;
            archiveType.imageData = imageData;
        }

        return archiveType;
    }
}