import HabboAssetSWF from "../../swf/HabboAssetSWF";
import ArchiveType from "../ArchiveType";
import File from "../../utils/File";
import NitroBundle from "../../utils/NitroBundle";
import {FurniJson} from "../furniture/FurniTypes";
import DefineBinaryDataTag from "../../swf/tags/DefineBinaryDataTag";
import PetJsonMapper from "./PetJsonMapper";

const xml2js = require('xml2js');
const parser = new xml2js.Parser(/* options */);

const fs = require('fs').promises;

export default class PetConverter {

    private readonly _petJsonMapper: PetJsonMapper;

    constructor() {
        this._petJsonMapper = new PetJsonMapper();
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
        const binaryData: DefineBinaryDataTag | null = PetConverter.getBinaryData(habboAssetSWF, "assets", true);
        if (binaryData !== null) {
            return await parser.parseStringPromise(binaryData.binaryData);
        }

        return null;
    }

    private static async getLogicXML(habboAssetSWF: HabboAssetSWF): Promise<any> {
        const binaryData: DefineBinaryDataTag | null = PetConverter.getBinaryData(habboAssetSWF, "logic", true);
        if (binaryData !== null) {
            return await parser.parseStringPromise(binaryData.binaryData);
        }

        return null;
    }

    private static async getIndexXML(habboAssetSWF: HabboAssetSWF): Promise<any> {
        const binaryData: DefineBinaryDataTag | null = PetConverter.getBinaryData(habboAssetSWF, "index", false);
        if (binaryData !== null) {
            return await parser.parseStringPromise(binaryData.binaryData);
        }

        return null;
    }

    private static async getVisualizationXML(habboAssetSWF: HabboAssetSWF): Promise<any> {
        const binaryData: DefineBinaryDataTag | null = PetConverter.getBinaryData(habboAssetSWF, "visualization", true);
        if (binaryData !== null) {
            return await parser.parseStringPromise(binaryData.binaryData);
        }

        return null;
    }

    private async convertXML2JSON(habboAssetSWF: HabboAssetSWF): Promise<FurniJson | null> {
        const assetXml = await PetConverter.getAssetsXML(habboAssetSWF);
        const logicXml = await PetConverter.getLogicXML(habboAssetSWF);
        const indexXml = await PetConverter.getIndexXML(habboAssetSWF);
        const visualizationXml = await PetConverter.getVisualizationXML(habboAssetSWF);

        return this._petJsonMapper.mapXML(habboAssetSWF, assetXml, indexXml, logicXml, visualizationXml);
    }

    public async fromHabboAsset(habboAssetSWF: HabboAssetSWF, outputFolder: string, type: string, archiveType: ArchiveType) {
        const petJson = await this.convertXML2JSON(habboAssetSWF);
        if (petJson !== null) {
            petJson.spritesheet = archiveType.spriteSheetType;
            petJson.type = type;

            const path = outputFolder + "/" + habboAssetSWF.getDocumentClass() + ".nitro";
            const assetOutputFolder = new File(path);
            if (assetOutputFolder.exists()) {
                console.log("Pet already exists or the directory is not empty!");

                return;
            }

            const nitroBundle = new NitroBundle();
            nitroBundle.addFile(habboAssetSWF.getDocumentClass() + ".json", Buffer.from(JSON.stringify(petJson)));
            nitroBundle.addFile(archiveType.imageData.name, archiveType.imageData.buffer);

            const buffer = await nitroBundle.toBufferAsync();
            await fs.writeFile(path, buffer);
        }
    }
}