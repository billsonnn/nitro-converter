import "reflect-metadata";
import Configuration from "./config/Configuration";
import {container} from "tsyringe";
import FigureConverter from "./figure/FigureConverter";
import FurnitureConverter from "./furniture/FurnitureConverter";
import PetConverter from "./pet/PetConverter";
import EffectConverter from "./effect/EffectConverter";

(async () => {
    const config = container.resolve(Configuration);
    await config.init();

    if (config.getBoolean("convert.figure")) {
        const figureConverter = container.resolve(FigureConverter);
        await figureConverter.convertAsync();
    }

    if (config.getBoolean("convert.furniture")) {
        const furnitureConverter = container.resolve(FurnitureConverter);
        await furnitureConverter.convertAsync();
    }

    if (config.getBoolean("convert.pet")) {
        const petConverter = container.resolve(PetConverter);
        await petConverter.convertAsync();
    }

    if (config.getBoolean("convert.effect")) {
        const effectConverter = container.resolve(EffectConverter);
        await effectConverter.convertAsync();
    }

    console.log('finished!');
})()