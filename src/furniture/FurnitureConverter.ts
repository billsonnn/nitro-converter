import FurniJsonMapper from "./mapper/FurniJsonMapper";
import Configuration from "../config/Configuration";
import HabboAssetSWF from "../swf/HabboAssetSWF";
import DefineBinaryDataTag from "../swf/tags/DefineBinaryDataTag";
import {FurniJson} from "./mapper/FurniTypes";
import BundleTypes from "../bundle/BundleTypes";
import File from "../utils/File";
import NitroBundle from "../utils/NitroBundle";
import BundleProvider from "../bundle/BundleProvider";
import FurnitureDownloader from "./FurnitureDownloader";
import {singleton} from "tsyringe";
import Logger from "../utils/Logger";

const xml2js = require('xml2js');
const parser = new xml2js.Parser(/* options */);

const fs = require('fs').promises;

@singleton()
export default class FurnitureConverter {

    constructor(
        private readonly _furniDownloader: FurnitureDownloader,
        private readonly _furniJsonMapper: FurniJsonMapper,
        private readonly _config: Configuration,
        private readonly _bundleProvider: BundleProvider,
        private readonly _logger: Logger) {
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

    private async fromHabboAsset(habboAssetSWF: HabboAssetSWF, outputFolder: string, type: string, archiveType: BundleTypes) {
        const furnitureJson = await this.convertXML2JSON(habboAssetSWF);
        if (furnitureJson !== null) {
            furnitureJson.spritesheet = archiveType.spriteSheetType;
            furnitureJson.type = type;

            const path = outputFolder + "/" + habboAssetSWF.getDocumentClass() + ".nitro";
            const assetOutputFolder = new File(path);
            if (assetOutputFolder.exists()) {
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

    public async convertAsync() {
        const outputFolderFurniture = new File(this._config.getValue("output.folder.furniture"));
        if (!outputFolderFurniture.isDirectory()) {
            outputFolderFurniture.mkdirs();
        }

        const furnitureConverter = this;
        await this._furniDownloader.download(async function (habboAssetSwf: HabboAssetSWF, className: string) {
            console.log("Attempt parsing furniture: " + habboAssetSwf.getDocumentClass());

            try {
                const spriteSheetType = await furnitureConverter._bundleProvider.generateSpriteSheet(habboAssetSwf, outputFolderFurniture.path, "furniture");
                if (spriteSheetType !== null) {
                    await furnitureConverter.fromHabboAsset(habboAssetSwf, outputFolderFurniture.path, "furniture", spriteSheetType);
                }
            } catch (e) {
                await furnitureConverter._logger.logErrorAsync("Furniture error: " + habboAssetSwf.getDocumentClass() + " " + e);
            }
        });
    }
}