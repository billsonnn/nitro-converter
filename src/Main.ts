import Configuration from "./config/Configuration";
import FigureDownloader from "./downloaders/FigureDownloader";
import HabboAssetSWF from "./swf/HabboAssetSWF";
import SpriteSheetConverter from "./converters/util/SpriteSheetConverter";
import FigureConverter from "./converters/figure/FigureConverter";
import File from "./utils/File";
import FurnitureDownloader from "./downloaders/FurnitureDownloader";
import FurnitureConverter from "./converters/furniture/FurnitureConverter";
import EffectConverter from "./converters/effect/EffectConverter";
import EffectDownloader from "./downloaders/EffectDownloader";
import PetDownloader from "./downloaders/PetDownloader";
import PetConverter from "./converters/pet/PetConverter";

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

    const outputFolderEffect = new File(config.getValue("output.folder.effect"));
    if (!outputFolderEffect.isDirectory()) {
        outputFolderEffect.mkdirs();
    }

    const outputFolderPet = new File(config.getValue("output.folder.pet"));
    if (!outputFolderPet.isDirectory()) {
        outputFolderPet.mkdirs();
    }

    const spriteSheetConverter = new SpriteSheetConverter();
    const figureConverter = new FigureConverter(config);
    const furnitureConverter = new FurnitureConverter(config);
    const effectConverter = new EffectConverter(config);
    const petConverter = new PetConverter();

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
                console.log(e);
            }
        });
    }

    if (config.getBoolean("convert.furniture")) {
        let count = 0;
        const furnitureDownloader = new FurnitureDownloader(config);
        await furnitureDownloader.download(async function (habboAssetSwf: HabboAssetSWF, className: string) {
            console.log("Attempt parsing furniture: " + habboAssetSwf.getDocumentClass());

            try {
                const spriteSheetType = await spriteSheetConverter.generateSpriteSheet(habboAssetSwf, outputFolderFurniture.path, "furniture");
                if (spriteSheetType !== null) {
                    await furnitureConverter.fromHabboAsset(habboAssetSwf, outputFolderFurniture.path, "furniture", spriteSheetType);
                }
            } catch (e) {
                console.log("Furniture error: " + habboAssetSwf.getDocumentClass());
                console.log(e);
            }
        });

        console.log(`Parsed ${++count} furnitures`)
    }

    if (config.getBoolean("convert.effect")) {
        const effectDownloader = new EffectDownloader(config);
        await effectDownloader.download(async function (habboAssetSwf: HabboAssetSWF) {
            console.log("Attempt parsing effect: " + habboAssetSwf.getDocumentClass());

            try {
                const spriteSheetType = await spriteSheetConverter.generateSpriteSheet(habboAssetSwf, outputFolderFurniture.path, "effect");
                if (spriteSheetType !== null) {
                    await effectConverter.fromHabboAsset(habboAssetSwf, outputFolderEffect.path, "effect", spriteSheetType);
                }
            } catch (e) {
                console.log(e);
                console.log("Effect error: " + habboAssetSwf.getDocumentClass());
            }
        });
    }

    if (config.getBoolean("convert.pet")) {
        const petDownloader = new PetDownloader(config);
        await petDownloader.download(async function (habboAssetSwf: HabboAssetSWF) {
            console.log("Attempt parsing pet: " + habboAssetSwf.getDocumentClass());

            try {
                const spriteSheetType = await spriteSheetConverter.generateSpriteSheet(habboAssetSwf, outputFolderPet.path, "pet");
                if (spriteSheetType !== null) {
                    await petConverter.fromHabboAsset(habboAssetSwf, outputFolderPet.path, "pet", spriteSheetType);
                }
            } catch (e) {
                console.log(e);
                console.log("Effect error: " + habboAssetSwf.getDocumentClass());
            }
        });
    }

    console.log('finished!');

    /*
    outputFolderFurniture.rmdir({
        recursive: true,
        force: true
    });*/
})()