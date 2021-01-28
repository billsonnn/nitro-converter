import HabboAssetSWF from "../swf/HabboAssetSWF";
import Configuration from "../config/Configuration";
import {type} from "os";
import File from "../utils/File";

const fs = require("fs");
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const parser = new xml2js.Parser(/* options */);
const util = require('util');

const readFile = util.promisify(fs.readFile);

export default class FurnitureDownloader {

    private readonly _config: Configuration;

    constructor(config: Configuration) {
        this._config = config;
    }

    public async download(callback: (habboAssetSwf: HabboAssetSWF, className: string) => Promise<void>) {

        const outputFolderFurniture = new File(this._config.getValue("output.folder.furniture"));

        const furniDataObj = await this.parseFurniData();
        const furniData = furniDataObj.furnidata;

        const roomitemtypes = furniData.roomitemtypes;
        const wallitemtypes = furniData.wallitemtypes;

        for (const roomItem of roomitemtypes) {
            for (const furnitype of roomItem.furnitype) {
                const attributes = furnitype['$'];
                const className = attributes.classname.split("\*")[0];
                const revision = furnitype.revision[0];

                const assetOuputFolder = new File(outputFolderFurniture.path + "/" + className);
                if (assetOuputFolder.isDirectory()) {
                    continue;
                }

                await this.extractFurniture(revision, className, callback);
            }
        }

        for (const wallItem of wallitemtypes) {
            for (const furnitype of wallItem.furnitype) {
                const attributes = furnitype['$'];
                const className = attributes.classname.split("\*")[0];
                const revision = furnitype.revision[0];

                const assetOuputFolder = new File(outputFolderFurniture + "/" + className);
                if (assetOuputFolder.isDirectory()) {
                    continue;
                }

                await this.extractFurniture(revision, className, callback);
            }
        }
    }

    async extractFurniture(revision: string, className: string, callback: (habboAssetSwf: HabboAssetSWF, className: string) => Promise<void>) {
        if (className !== "rare_dragonlamp") return;

        const url = this._config.getValue("dynamic.download.url.furniture").replace("%revision%", revision).replace("%className%", className);
        const file = new File(url);
        if (!file.exists()) {
            console.log("SWF File does not exist: " + file.path);
            return;
        }

        try {
            const buffer: Buffer = await readFile(url);
            const habboAssetSWF = new HabboAssetSWF(buffer);
            await habboAssetSWF.setupAsync();

            await callback(habboAssetSWF, className);
        } catch (e) {
            console.log("Error with furniture: " + url);
            console.log(e);
        }
    }

    async parseFurniData() {
        const furniDataFetch = this._config.getValue("furnidata.url");
        const furniFetch = await fetch(furniDataFetch);
        const furniData = await furniFetch.text();

        return await parser.parseStringPromise(furniData);
    }
}