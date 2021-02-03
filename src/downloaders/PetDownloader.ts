import Configuration from "../config/Configuration";
import HabboAssetSWF from "../swf/HabboAssetSWF";
import File from "../utils/File";

const util = require('util');
const fs = require("fs");
const readFile = util.promisify(fs.readFile);

export default class PetDownloader {
    private readonly _config: Configuration;

    constructor(config: Configuration) {
        this._config = config;
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
                    const file = new File(url);
                    if (!file.exists()) {
                        console.log("SWF File does not exist: " + file.path);
                        continue;
                    }

                    const newHabboAssetSWF: HabboAssetSWF = new HabboAssetSWF(url);
                    await newHabboAssetSWF.setupAsync();

                    await callback(newHabboAssetSWF);
                }

                itemClassNames.push(pet);
            }
        }
    }
}