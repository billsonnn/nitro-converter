import Configuration from "../config/Configuration";
import HabboAssetSWF from "../swf/HabboAssetSWF";
import File from "../utils/File";
import {singleton} from "tsyringe";
import Logger from "../utils/Logger";

const fetch = require('node-fetch');

@singleton()
export default class PetDownloader {
    constructor(
        private readonly _config: Configuration,
        private readonly _logger: Logger) {
    }

    public async download(callback: (habboAssetSwf: HabboAssetSWF) => Promise<void>) {
        const outputFolderPet = new File(this._config.getValue("output.folder.pet"));
        await this._config.loadExternalVariables();

        const pets = this._config.getValue("pet.configuration");
        if (pets !== "") {
            const itemClassNames: Array<string> = new Array<string>();
            const petNames: string[] = pets.split(",");

            for (const pet of petNames) {
                const petOutputFolder = new File(outputFolderPet.path + "/" + pet);
                if (petOutputFolder.isDirectory()) {
                    continue;
                }

                if (!itemClassNames.includes(pet)) {
                    const url = this._config.getValue("dynamic.download.url.pet").replace("%className%", pet);
                    let buffer: Buffer | null = null;

                    if (url.includes("http")) {
                        const fetchData = await fetch(url);
                        if (fetchData.status === 404) {
                            console.log("SWF File does not exist: " + url);
                            continue;
                        }

                        const arrayBuffer = await fetchData.arrayBuffer();
                        buffer = Buffer.from(arrayBuffer);
                        console.log(buffer.toString('utf-8'));
                    } else {
                        const file = new File(url);
                        if (!file.exists()) {
                            console.log("SWF File does not exist: " + file.path);
                            return;
                        }
                    }

                    try {
                        const newHabboAssetSWF: HabboAssetSWF = new HabboAssetSWF(buffer !== null ? buffer : url);
                        await newHabboAssetSWF.setupAsync();

                        await callback(newHabboAssetSWF);
                    } catch (e) {
                        await this._logger.logErrorAsync(`[${pet}]` + e);
                    }
                }

                itemClassNames.push(pet);
            }
        }
    }
}