import HabboAssetSWF from "../../swf/HabboAssetSWF";
import DefineBinaryDataTag from "../../swf/tags/DefineBinaryDataTag";
import Configuration from "../../config/Configuration";
import FurniJsonMapper from "./FurniJsonMapper";
import {FurniJson} from "./FurniTypes";
import File from "../../utils/File";
import ArchiveType from "../ArchiveType";
import NitroBundle from "../../utils/NitroBundle";

const xml2js = require('xml2js');
const parser = new xml2js.Parser(/* options */);

const fs = require('fs').promises;

export default class FurnitureConverter {

    private readonly _furniJsonMapper: FurniJsonMapper;

    constructor(config: Configuration) {
        this._furniJsonMapper = new FurniJsonMapper();
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

    private static async getAssetsXML(habboAssetSWF: HabboAssetSWF): Promise<any> {
        const binaryData: DefineBinaryDataTag | null = FurnitureConverter.getBinaryData(habboAssetSWF, "assets", true);
        if (binaryData !== null) {
            return await parser.parseStringPromise(binaryData.binaryData);
        }

        return null;
    }

    private static async getLogicXML(habboAssetSWF: HabboAssetSWF): Promise<any> {
        const binaryData: DefineBinaryDataTag | null = FurnitureConverter.getBinaryData(habboAssetSWF, "logic", true);
        if (binaryData !== null) {
            return await parser.parseStringPromise(binaryData.binaryData);
        }

        return null;
    }

    private static async getIndexXML(habboAssetSWF: HabboAssetSWF): Promise<any> {
        const binaryData: DefineBinaryDataTag | null = FurnitureConverter.getBinaryData(habboAssetSWF, "index", false);
        if (binaryData !== null) {
            return await parser.parseStringPromise(binaryData.binaryData);
        }

        return null;
    }

    private static async getVisualizationXML(habboAssetSWF: HabboAssetSWF): Promise<any> {
        const binaryData: DefineBinaryDataTag | null = FurnitureConverter.getBinaryData(habboAssetSWF, "visualization", true);
        if (binaryData !== null) {
            return await parser.parseStringPromise(binaryData.binaryData);
        }

        return null;
    }

    private async convertXML2JSON(habboAssetSWF: HabboAssetSWF): Promise<FurniJson | null> {
        const assetXml = await FurnitureConverter.getAssetsXML(habboAssetSWF);
        const logicXml = await FurnitureConverter.getLogicXML(habboAssetSWF);
        const indexXml = await FurnitureConverter.getIndexXML(habboAssetSWF);
        const visualizationXml = await FurnitureConverter.getVisualizationXML(habboAssetSWF);

        return this._furniJsonMapper.mapXML(assetXml, indexXml, logicXml, visualizationXml);
    }

    public async fromHabboAsset(habboAssetSWF: HabboAssetSWF, outputFolder: string, type: string, archiveType: ArchiveType) {
        const furnitureJson = await this.convertXML2JSON(habboAssetSWF);
        if (furnitureJson !== null) {
            furnitureJson.spritesheet = archiveType.spriteSheetType;
            furnitureJson.type = type;

            const path = outputFolder + "/" + habboAssetSWF.getDocumentClass() + ".nitro";
            const assetOuputFolder = new File(path);
            if (assetOuputFolder.exists()) {
                console.log("Furniture already exists or the directory is not empty!");

                return;
            }

            const nitroBundle = new NitroBundle();
            nitroBundle.addFile(habboAssetSWF.getDocumentClass() + ".json", Buffer.from(JSON.stringify(furnitureJson)));
            nitroBundle.addFile(archiveType.imageData.name, archiveType.imageData.buffer);

            const buffer = await nitroBundle.toBufferAsync();
            await fs.writeFile(path, buffer);
        }
    }
}