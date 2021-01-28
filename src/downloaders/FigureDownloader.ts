import Configuration from "../config/Configuration";
import HabboAssetSWF from "../swf/HabboAssetSWF";
import File from "../utils/File";

const fs = require("fs");
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const parser = new xml2js.Parser(/* options */);
const util = require('util');

const readFile = util.promisify(fs.readFile);

export default class FigureDownloader {

    private readonly _config: Configuration;

    constructor(config: Configuration) {
        this._config = config;
    }


    public static types: Map<String, String> = new Map<String, String>();

    public async download(callback: (habboAssetSwf: HabboAssetSWF) => Promise<void>) {
        const outputFolderFigure = this._config.getValue("output.folder.figure");
        const figureMap = await this.parseFigureMap();
        const map = figureMap.map;

        for (const lib of map.lib) {
            const info = lib['$'];
            const className: string = info.id.split("\\*")[0];
            if (className === "hh_human_fx") {
                continue;
            }

            const assetOutputFolder = new File(outputFolderFigure + "/" + className);
            if (assetOutputFolder.exists()) {
                continue;
            }

            if (!FigureDownloader.types.has(className)) {
                if (className !== "jacket_U_snowwar4_team1" &&
                    className !== "jacket_U_snowwar4_team2") { //TODO: Figure out why snowstorm assets aren't converting...

                    const url = this._config.getValue("dynamic.download.url.figure").replace("%className%", className);
                    if (!fs.existsSync(url)) {
                        console.log("SWF File does not exist: " + url);
                        return;
                    }

                    const buffer: Buffer = await readFile(url);
                    const habboAssetSWF = new HabboAssetSWF(buffer);
                    await habboAssetSWF.setupAsync();

                    FigureDownloader.types.set(className, lib.part[0]['$'].type);
                    await callback(habboAssetSWF);
                }
            }
        }
    }

    async parseFigureMap() {
        const figureMapPath = this._config.getValue("figuremap.url");
        const figureFetch = await fetch(figureMapPath);
        const figureMap = await figureFetch.text();

        return await parser.parseStringPromise(figureMap);
    }
}