import Configuration from "../config/Configuration";
import HabboAssetSWF from "../swf/HabboAssetSWF";
import File from "../utils/File";

const fs = require("fs");
const fetch = require('node-fetch');
const xml2js = require('xml2js');
const parser = new xml2js.Parser(/* options */);

export default class FigureDownloader {

    private readonly _config: Configuration;

    constructor(config: Configuration) {
        this._config = config;
    }


    public static types: Map<string, string> = new Map<string, string>();

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
                    let buffer: Buffer | null = null;

                    if (url.includes("http")) {
                        const fetchData = await fetch(url);
                        if (fetchData.status === 404) {
                            console.log("SWF File does not exist: " + url);
                            continue;
                        }

                        const arrayBuffer = await fetchData.arrayBuffer();
                        buffer = Buffer.from(arrayBuffer);
                    } else {
                        const file = new File(url);
                        if (!file.exists()) {
                            console.log("SWF File does not exist: " + file.path);
                            return;
                        }
                    }

                    const newHabboAssetSWF: HabboAssetSWF = new HabboAssetSWF(buffer !== null ? buffer : url);
                    await newHabboAssetSWF.setupAsync();

                    FigureDownloader.types.set(className, lib.part[0]['$'].type);
                    await callback(newHabboAssetSWF);
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