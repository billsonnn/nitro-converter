import Configuration from "../../config/Configuration";
import HabboAssetSWF from "../../swf/HabboAssetSWF";
import {FigureAsset, FigureAssets, FigureJson} from "./FigureType";
import FigureDownloader from "../../downloaders/FigureDownloader";
import SpriteSheetConverter from "../util/SpriteSheetConverter";

export default class FigureJsonMapper {

    private static MUST_START_WITH: string = "h_";

    private readonly _config: Configuration;

    constructor(config: Configuration) {
        this._config = config;
    }


    public mapXML(habboAssetSWF: HabboAssetSWF, manifestXML: any): FigureJson {
        const name = habboAssetSWF.getDocumentClass();

        return {
            name: name,
            type: FigureDownloader.types.get(name) as string,
            assets: this.mapManifestXML(habboAssetSWF, manifestXML),
            spritesheet: null as any
        };
    }

    private mapManifestXML(habboAssetSWF: HabboAssetSWF, manifestXML: any): FigureAssets {
        const assets: any = {};

        const libraries = manifestXML.manifest.library;
        for (const library of libraries) {
            for (const assetObj of library.assets) {
                for (const asset of assetObj.asset) {
                    const assetInfo = asset['$'];
                    const name = assetInfo.name;

                    if (name.startsWith(FigureJsonMapper.MUST_START_WITH)) {
                        let hasImage = false;
                        for (const imageTag of habboAssetSWF.imageTags()) {
                            if (imageTag.className.includes(name)) {
                                hasImage = true;
                            }
                        }

                        if (hasImage || !this._config.getBoolean("figure.skip.non-existing.asset.images")) {
                            const figureAsset: FigureAsset = {} as any;
                            figureAsset.name = name;
                            figureAsset.x = asset.param[0]['$'].value.split(',')[0];
                            figureAsset.y = asset.param[0]['$'].value.split(',')[1];

                            if (SpriteSheetConverter.imageSource.has(name)) {
                                figureAsset.source = SpriteSheetConverter.imageSource.get(name) as string;
                            }

                            assets[name] = figureAsset;
                            /*FigureJSON.Asset asset = new FigureJSON.Asset();
                            if (FFConverter.getConfig().getBoolean("figure.rotation.enabled")) {
                                String[] names = assetXML.getName().split("_");
                                if (this.isInteger(names[4])) {
                                    String firstName = names[0] + "_" + names[1] + "_" + names[2] + "_" + names[3] + "_%ROTATION%_" + names[5];
                                    Integer rotation = Integer.parseInt(names[4]);
                                    if (rotation >= 0 && rotation < 8) {
                                        if (assetRotations.containsKey(firstName)) {
                                            assetRotations.get(firstName).add(rotation);
                                        } else {
                                            List<Integer> rotations = new ArrayList<Integer>();
                                            rotations.add(rotation);
                                            assetRotations.put(firstName, rotations);
                                        }
                                    }
                                }
                            }*/
                        } else {
                            console.log("Image " + name + " did not decompile for some reason");
                        }
                    }
                }
            }
        }

        return assets;
    }
}