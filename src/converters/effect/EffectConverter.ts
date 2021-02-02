import HabboAssetSWF from "../../swf/HabboAssetSWF";
import DefineBinaryDataTag from "../../swf/tags/DefineBinaryDataTag";
import ArchiveType from "../ArchiveType";
import File from "../../utils/File";
import NitroBundle from "../../utils/NitroBundle";
import {EffectJson} from "./EffectTypes";
import Configuration from "../../config/Configuration";
import EffectJsonMapper from "./EffectJsonMapper";

const xml2js = require('xml2js');
const parser = new xml2js.Parser(/* options */);

const fs = require('fs').promises;

export default class EffectConverter {
    private readonly _effectJsonMapper: EffectJsonMapper;

    constructor(config: Configuration) {
        this._effectJsonMapper = new EffectJsonMapper();
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

    public async fromHabboAsset(habboAssetSWF: HabboAssetSWF, outputFolder: string, type: string, archiveType: ArchiveType) {
        const effectJson = await this.convertXML2JSON(habboAssetSWF);
        if (effectJson !== null) {
            effectJson.spritesheet = archiveType.spriteSheetType;
            effectJson.type = type;

            const path = outputFolder + "/" + habboAssetSWF.getDocumentClass() + ".nitro";
            const assetOuputFolder = new File(path);
            if (assetOuputFolder.exists()) {
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
}