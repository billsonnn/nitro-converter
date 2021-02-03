import Configuration from "../config/Configuration";
import HabboAssetSWF from "../swf/HabboAssetSWF";
import File from "../utils/File";

const fetch = require('node-fetch');

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

                    await callback(newHabboAssetSWF);
                }

                itemClassNames.push(pet);
            }
        }
    }
}