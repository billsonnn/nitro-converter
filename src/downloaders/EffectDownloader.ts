import Configuration from "../config/Configuration";
import HabboAssetSWF from "../swf/HabboAssetSWF";
import File from "../utils/File";

const fs = require("fs");
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const parser = new xml2js.Parser(/* options */);
const util = require('util');

const readFile = util.promisify(fs.readFile);

export default class EffectDownloader {
    private readonly _config: Configuration;

    constructor(config: Configuration) {
        this._config = config;
    }


    public static types: Map<string, string> = new Map<string, string>();

    public async download(callback: (habboAssetSwf: HabboAssetSWF) => Promise<void>) {
        const outputFolderEffect = this._config.getValue("output.folder.effect");
        const figureMap = await this.parseEffectMap();
        const map = figureMap.map;

        for (const lib of map.effect) {
            const info = lib['$'];
            const className: string = info.lib;

            //if (className !== 'Hoverboard' && className !== 'Staff' && className !== 'ZombieMask' && className !== 'ESredUntouchable') continue;

            const assetOutputFolder = new File(outputFolderEffect + "/" + className);
            if (assetOutputFolder.exists()) {
                continue;
            }

            if (!EffectDownloader.types.has(className)) {
                const url = this._config.getValue("dynamic.download.url.effect").replace("%className%", className);
                if (!fs.existsSync(url)) {
                    console.log("SWF File does not exist: " + url);
                    continue;
                }

                try {
                    const newHabboAssetSWF: HabboAssetSWF = new HabboAssetSWF(url);
                    await newHabboAssetSWF.setupAsync();

                    EffectDownloader.types.set(className, info.type);
                    await callback(newHabboAssetSWF);
                } catch (e) {
                    console.log(className);
                    console.log(e);
                }
            }
        }
    }

    async parseEffectMap() {
        const figureMapPath = this._config.getValue("effectmap.url");
        const figureFetch = await fetch(figureMapPath);
        const figureMap = await figureFetch.text();

        return await parser.parseStringPromise(figureMap);
    }
}