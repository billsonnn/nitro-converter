import HabboAssetSWF from "../swf/HabboAssetSWF";
import DefineBinaryDataTag from "../swf/tags/DefineBinaryDataTag";
import {EffectJson} from "./mapper/EffectTypes";
import BundleTypes from "../bundle/BundleTypes";
import File from "../utils/File";
import NitroBundle from "../utils/NitroBundle";
import EffectDownloader from "./EffectDownloader";
import EffectJsonMapper from "./mapper/EffectJsonMapper";
import Configuration from "../config/Configuration";
import BundleProvider from "../bundle/BundleProvider";
import {singleton} from "tsyringe";

const xml2js = require('xml2js');
const parser = new xml2js.Parser(/* options */);

const fs = require('fs').promises;

@singleton()
export default class EffectConverter {
    constructor(
        private readonly _effectDownloader: EffectDownloader,
        private readonly _effectJsonMapper: EffectJsonMapper,
        private readonly _config: Configuration,
        private readonly _bundleProvider: BundleProvider) {
    }

    private static getBinaryData(habboAssetSWF: HabboAssetSWF, type: string, documentNameTwice: boolean) {
        let binaryName: string = habboAssetSWF.getFullClassName(type, documentNameTwice);
        let tag = habboAssetSWF.getBinaryTagByName(binaryName);
        if (tag === null) {
            binaryName = habboAssetSWF.getFullClassNameSnake(type, documentNameTwice, true);
            tag = habboAssetSWF.getBinaryTagByName(binaryName);
        }

        return tag;
    }

    private static async getManifestXML(habboAssetSWF: HabboAssetSWF): Promise<any> {
        const binaryData: DefineBinaryDataTag | null = this.getBinaryData(habboAssetSWF, "manifest", false);
        if (binaryData !== null) {
            return await parser.parseStringPromise(binaryData.binaryData);
        }

        return null;
    }

    private static async getAnimationXML(habboAssetSWF: HabboAssetSWF): Promise<any> {
        const binaryData: DefineBinaryDataTag | null = this.getBinaryData(habboAssetSWF, "animation", false);
        if (binaryData !== null) {
            return await parser.parseStringPromise(binaryData.binaryData);
        }

        return null;
    }

    private async convertXML2JSON(habboAssetSWF: HabboAssetSWF): Promise<EffectJson | null> {
        const manifestXML = await EffectConverter.getManifestXML(habboAssetSWF);
        const animationXML = await EffectConverter.getAnimationXML(habboAssetSWF);

        return this._effectJsonMapper.mapXML(habboAssetSWF, manifestXML, animationXML);
    }

    private async fromHabboAsset(habboAssetSWF: HabboAssetSWF, outputFolder: string, type: string, archiveType: BundleTypes) {
        const effectJson = await this.convertXML2JSON(habboAssetSWF);
        if (effectJson !== null) {
            effectJson.spritesheet = archiveType.spriteSheetType;
            effectJson.type = type;

            const path = outputFolder + "/" + habboAssetSWF.getDocumentClass() + ".nitro";
            const assetOutputFolder = new File(path);
            if (assetOutputFolder.exists()) {
                console.log("Effect already exists or the directory is not empty!");

                return;
            }

            const nitroBundle = new NitroBundle();
            nitroBundle.addFile(habboAssetSWF.getDocumentClass() + ".json", Buffer.from(JSON.stringify(effectJson)));
            nitroBundle.addFile(archiveType.imageData.name, archiveType.imageData.buffer);

            const buffer = await nitroBundle.toBufferAsync();
            await fs.writeFile(path, buffer);
        }
    }

    public async convertAsync() {
        const outputFolderEffect = new File(this._config.getValue("output.folder.effect"));
        if (!outputFolderEffect.isDirectory()) {
            outputFolderEffect.mkdirs();
        }

        const effectConverter = this;
        await this._effectDownloader.download(async function (habboAssetSwf: HabboAssetSWF) {
            console.log("Attempt parsing effect: " + habboAssetSwf.getDocumentClass());

            try {
                const spriteSheetType = await effectConverter._bundleProvider.generateSpriteSheet(habboAssetSwf, outputFolderEffect.path, "effect");
                if (spriteSheetType !== null) {
                    await effectConverter.fromHabboAsset(habboAssetSwf, outputFolderEffect.path, "effect", spriteSheetType);
                }
            } catch (e) {
                console.log(e);
                console.log("Effect error: " + habboAssetSwf.getDocumentClass());
            }
        });
    }
}