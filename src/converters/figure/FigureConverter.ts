import HabboAssetSWF from "../../swf/HabboAssetSWF";
import {SpriteSheetType} from "../util/SpriteSheetTypes";
import DefineBinaryDataTag from "../../swf/tags/DefineBinaryDataTag";
import Configuration from "../../config/Configuration";
import FigureJsonMapper from "./FigureJsonMapper";
import {FigureJson} from "./FigureType";
import File from "../../utils/File";

const xml2js = require('xml2js');
const parser = new xml2js.Parser(/* options */);

const fs = require('fs').promises;
const {gzip} = require('node-gzip');

export default class FigureConverter {

    private readonly _figureJsonMapper: FigureJsonMapper;

    constructor(config: Configuration) {
        this._figureJsonMapper = new FigureJsonMapper(config);
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

    public async fromHabboAsset(habboAssetSWF: HabboAssetSWF, outputFolder: string, type: string, spriteSheetType: SpriteSheetType) {
        const manifestJson = await this.convertXML2JSON(habboAssetSWF);
        if (manifestJson !== null) {
            manifestJson.spritesheet = spriteSheetType;

            const path = outputFolder + "/" + habboAssetSWF.getDocumentClass() + ".nitro";
            const assetOuputFolder = new File(path);
            if (assetOuputFolder.exists()) {
                console.log("Furniture already exists or the directory is not empty!");

                return;
            }

            const compressed = await gzip(JSON.stringify(manifestJson));
            await fs.writeFile(path, compressed);
        }
    }
}