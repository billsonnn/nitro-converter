import {singleton} from "tsyringe";
import HabboAssetSWF from "../swf/HabboAssetSWF";
import FigureJsonMapper from "./mapper/FigureJsonMapper";
import Configuration from "../config/Configuration";
import {FigureJson} from "./mapper/FigureJsonType";
import DefineBinaryDataTag from "../swf/tags/DefineBinaryDataTag";
import BundleTypes from "../bundle/BundleTypes";
import File from "../utils/File";
import NitroBundle from "../utils/NitroBundle";
import BundleProvider from "../bundle/BundleProvider";
import FigureDownloader from "./FigureDownloader";
import Logger from "../utils/Logger";

const xml2js = require('xml2js');
const parser = new xml2js.Parser(/* options */);
const fs = require('fs').promises;

@singleton()
export default class FigureConverter {

    constructor(
        private readonly _figureDownloader: FigureDownloader,
        private readonly _figureJsonMapper: FigureJsonMapper,
        private readonly _config: Configuration,
        private readonly _bundleProvider: BundleProvider,
        private readonly _logger: Logger) {
    }

    private getBinaryData(habboAssetSWF: HabboAssetSWF, type: string, documentNameTwice: boolean) {
        let binaryName: string = habboAssetSWF.getFullClassName(type, documentNameTwice);
        let tag = habboAssetSWF.getBinaryTagByName(binaryName);
        if (tag === null) {
            binaryName = habboAssetSWF.getFullClassNameSnake(type, documentNameTwice, true);
            tag = habboAssetSWF.getBinaryTagByName(binaryName);
        }

        return tag;
    }

    private async convertXML2JSON(habboAssetSWF: HabboAssetSWF): Promise<FigureJson | null> {
        const manifestXML: DefineBinaryDataTag | null = this.getBinaryData(habboAssetSWF, "manifest", false);
        if (manifestXML !== null) {
            const result = await parser.parseStringPromise(manifestXML.binaryData);

            return this._figureJsonMapper.mapXML(habboAssetSWF, result);
        }

        return null;
    }

    private async fromHabboAsset(habboAssetSWF: HabboAssetSWF, outputFolder: string, type: string, archiveType: BundleTypes) {
        const manifestJson = await this.convertXML2JSON(habboAssetSWF);
        if (manifestJson !== null) {
            manifestJson.spritesheet = archiveType.spriteSheetType;

            const path = outputFolder + "/" + habboAssetSWF.getDocumentClass() + ".nitro";
            const assetOuputFolder = new File(path);
            if (assetOuputFolder.exists()) {
                console.log("Figure already exists or the directory is not empty!");

                return;
            }

            const nitroBundle = new NitroBundle();
            nitroBundle.addFile(habboAssetSWF.getDocumentClass() + ".json", Buffer.from(JSON.stringify(manifestJson)));
            nitroBundle.addFile(archiveType.imageData.name, archiveType.imageData.buffer);

            const buffer = await nitroBundle.toBufferAsync();
            await fs.writeFile(path, buffer);
        }
    }

    public async convertAsync() {
        const outputFolderFigure = new File(this._config.getValue("output.folder.figure"));
        if (!outputFolderFigure.isDirectory()) {
            outputFolderFigure.mkdirs();
        }

        const figureConverter = this;

        await this._figureDownloader.download(async function (habboAssetSwf: HabboAssetSWF) {

            console.log("Attempt parsing figure: " + habboAssetSwf.getDocumentClass());

            try {
                const spriteSheetType = await figureConverter._bundleProvider.generateSpriteSheet(habboAssetSwf, outputFolderFigure.path, "figure");
                if (spriteSheetType !== null)
                    await figureConverter.fromHabboAsset(habboAssetSwf, outputFolderFigure.path, "figure", spriteSheetType);

            } catch (e) {
                await figureConverter._logger.logErrorAsync("Figure error: " + habboAssetSwf.getDocumentClass() + e);
                console.log("Figure error: " + habboAssetSwf.getDocumentClass());
                console.log(e);
            }
        });
    }
}