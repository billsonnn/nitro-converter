import Configuration from "./config/Configuration";
import FigureDownloader from "./downloaders/FigureDownloader";
import HabboAssetSWF from "./swf/HabboAssetSWF";
import SpriteSheetConverter from "./converters/util/SpriteSheetConverter";
import FigureConverter from "./converters/figure/FigureConverter";
import File from "./utils/File";
import FurnitureDownloader from "./downloaders/FurnitureDownloader";
import FurnitureConverter from "./converters/furniture/FurnitureConverter";

(async () => {
    const config = new Configuration();
    await config.init();

    const outputFolderFigure = new File(config.getValue("output.folder.figure"));
    if (!outputFolderFigure.isDirectory()) {
        outputFolderFigure.mkdirs();
    }

    const outputFolderFurniture = new File(config.getValue("output.folder.furniture"));
    if (!outputFolderFurniture.isDirectory()) {
        outputFolderFurniture.mkdirs();
    }

    const spriteSheetConverter = new SpriteSheetConverter();
    const figureConverter = new FigureConverter(config);
    const furnitureConverter= new FurnitureConverter(config);

    if (config.getBoolean("convert.figure")) {
        const figureDownloader = new FigureDownloader(config);
        await figureDownloader.download(async function (habboAssetSwf: HabboAssetSWF) {

            console.log("Attempt parsing figure: " + habboAssetSwf.getDocumentClass());

            try {
                const spriteSheetType = await spriteSheetConverter.generateSpriteSheet(habboAssetSwf, outputFolderFigure.path, "figure");
                if (spriteSheetType !== null)
                    await figureConverter.fromHabboAsset(habboAssetSwf, outputFolderFigure.path, "figure", spriteSheetType);

            } catch (e) {
                console.log("Figure error: " + habboAssetSwf.getDocumentClass());
            }
        });
    }

    let count = 0;

    if (config.getBoolean("convert.furniture")) {
        const furnitureDownloader = new FurnitureDownloader(config);
        await furnitureDownloader.download(async function (habboAssetSwf: HabboAssetSWF, className: string) {
            console.log("Attempt parsing furniture: " + habboAssetSwf.getDocumentClass());

            try {
                const assetOuputFolder = new File(outputFolderFurniture.path + "/" + className);
                if (!assetOuputFolder.isDirectory()) {
                    assetOuputFolder.mkdirs();
                } else if (assetOuputFolder.list().length > 0) {
                    console.log("Furniture already exists or the directory is not empty!");
                    return;
                }

                const spriteSheetType = await spriteSheetConverter.generateSpriteSheet(habboAssetSwf, assetOuputFolder.path, "furniture");
                if (spriteSheetType !== null) {
                    await furnitureConverter.fromHabboAsset(habboAssetSwf, assetOuputFolder.path, "furniture", spriteSheetType);
                }
            } catch (e) {
                console.log("Furniture error: " + habboAssetSwf.getDocumentClass());
                console.log(e);
            }
        });

        console.log(`Parsed ${++count} furnitures`)
    }

    console.log('finished!');

    /*

    outputFolderFurniture.rmdir({
        recursive: true,
        force: true
    });*/
})()