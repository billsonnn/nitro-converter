import SpriteSheetConverter from "../util/SpriteSheetConverter";
import {
    Action, Animation, AnimationLayer, AnimationLayers, Animations, Color, ColorLayer, ColorLayers, Colors,
    Direction,
    Directions, Frame, Frames, FrameSequence, FrameSequences, Gesture, Gestures,
    Layer, Offset, Palette,
    PetAsset,
    PetAssets,
    PetJson, Posture, Postures,
    Visualization,
    VisualizationLayers
} from "./PetTypes";
import {AssetsXML, IndexXML, LogicXML} from "./PetXMLTypes";
import {
    AnimationLayerXML,
    AnimationXML,
    ColorXML,
    LayerXML,
    VisualizationDataXML,
    VisualizationXML
} from "./VisualizationXMLTypes";
import HabboAssetSWF from "../../swf/HabboAssetSWF";
import RGB from "./RGB";

const ByteBuffer = require('bytebuffer');

export default class PetJsonMapper {


    private static readonly VISUALIZATION_DEFAULT_SIZE = 64;

    private static readonly VISUALIZATION_ICON_SIZE = 1;

    public mapXML(habboAssetSWF: HabboAssetSWF, assets: any, indexXML: any, logic: any, visualization: any): PetJson {
        const petJson: PetJson = {} as any;

        this.mapAssetsXML(habboAssetSWF, new AssetsXML(assets), petJson);
        PetJsonMapper.mapIndexXML(new IndexXML(indexXML.object), petJson);
        PetJsonMapper.mapLogicXML(new LogicXML(logic.objectData), petJson);
        PetJsonMapper.mapVisualizationXML(new VisualizationDataXML(visualization.visualizationData), petJson);

        return petJson;
    }


    private mapAssetsXML(habboAssetSWF: HabboAssetSWF, assetsXML: AssetsXML, output: PetJson) {
        const assets: PetAssets = {} as any;

        for (const asset of assetsXML.assets) {
            if (!asset.name.includes("_32_")) {
                const petAsset: PetAsset = {} as any;

                if (asset.source !== undefined) {
                    petAsset.source = asset.source;
                    if (SpriteSheetConverter.imageSource.has(asset.source)) {
                        petAsset.source = SpriteSheetConverter.imageSource.get(asset.source) as string;
                    }
                }

                if (SpriteSheetConverter.imageSource.has(asset.name)) {
                    petAsset.source = SpriteSheetConverter.imageSource.get(asset.name) as string;
                }

                petAsset.x = parseInt(asset.x.toString());
                petAsset.y = parseInt(asset.y.toString());
                petAsset.flipH = asset.flipH as any;
                petAsset.usesPalette = asset.usesPalette as any;
                assets[asset.name] = petAsset;
            }
        }

        const palettes: Array<Palette> = new Array<Palette>();
        if (assetsXML.palettes.length > 0) {
            for (const paletteXML of assetsXML.palettes) {
                const palette: Palette = {} as any;
                palette.id = parseInt(paletteXML.id.toString());
                palette.source = paletteXML.source;
                palette.color1 = paletteXML.color1;
                palette.color2 = paletteXML.color2;

                const paletteColors = this.getPalette(habboAssetSWF, paletteXML.source);

                const RGB: Array<Array<number>> = new Array<Array<number>>();
                if (paletteColors !== null)
                    for (const rgb of paletteColors) {
                        const rgbs: Array<number> = new Array<number>();
                        rgbs.push(rgb.r);
                        rgbs.push(rgb.g);
                        rgbs.push(rgb.b);
                        RGB.push(rgbs);
                    }

                palette.rgb = RGB;

                palettes.push(palette);
            }
        }

        if (Object.keys(assets).length > 0) {
            output.assets = assets;
        }

        output.palettes = palettes;
    }

    private getPalette(habboAssetSWF: HabboAssetSWF, paletteName: string): Array<RGB> | null {
        const binaryData = this.getBinaryData(habboAssetSWF, paletteName, false);
        if (binaryData !== null) {
            const byteBuffer = ByteBuffer.wrap(binaryData);
            const paletteColors: Array<RGB> = new Array<RGB>();

            try {
                let R = 0;
                let G = 0;
                let B = 0;
                let counter = 1;
                while ((binaryData.length - byteBuffer.offset) > 0) {
                    if (counter == 1) {
                        R = byteBuffer.readUInt8();
                    } else if (counter == 2) {
                        G = byteBuffer.readUInt8();
                    } else if (counter == 3) {
                        B = byteBuffer.readUInt8();
                        paletteColors.push(new RGB(R, G, B));
                        counter = 0;
                    }
                    counter++;
                }

                return paletteColors;
            } catch (err) {
                console.log(err);
            }
        }

        return null;
    }


    private getBinaryData(habboAssetSWF: HabboAssetSWF, type: string, documentNameTwice: boolean): Buffer | null {
        let binaryName = habboAssetSWF.getFullClassName(type, documentNameTwice);
        let tag = habboAssetSWF.getBinaryTagByName(binaryName);
        if (tag === null) {
            binaryName = habboAssetSWF.getFullClassNameSnake(type, documentNameTwice, true);
            tag = habboAssetSWF.getBinaryTagByName(binaryName);
        }
        if (tag === null) {
            return null;
        }

        return tag.binaryDataBuffer;
    }

    private static mapIndexXML(indexXML: IndexXML, output: PetJson) {
        output.name = indexXML.type;
        output.logicType = indexXML.logic;
        output.visualizationType = indexXML.visualization;
    }

    private static mapLogicXML(logicXML: LogicXML, output: PetJson) {
        output.dimensions = {
            x: parseInt(logicXML.model.dimensions.x.toString()),
            y: parseInt(logicXML.model.dimensions.y.toString()),
            z: parseInt(logicXML.model.dimensions.z.toString())
        }

        const directions: Array<number> = [];
        if (logicXML.model.directions.length === 0) {
            directions.push(0);
        } else {
            for (const direction of logicXML.model.directions) {
                directions.push(parseInt(direction.id.toString()));
            }
        }

        if (logicXML.mask !== undefined) {
            output.maskType = logicXML.mask.type;
        }

        output.directions = directions;
    }

    private static mapVisualizationXML(visualizationData: VisualizationDataXML, output: PetJson) {
        const visualizationsArray: Array<Visualization> = new Array<Visualization>();

        for (const visualization of visualizationData.visualizations) {
            if (visualization.size == PetJsonMapper.VISUALIZATION_DEFAULT_SIZE || visualization.size == PetJsonMapper.VISUALIZATION_ICON_SIZE) {
                const visualizationJson: Visualization = {} as any;
                visualizationJson.angle = parseInt(visualization.angle.toString());
                visualizationJson.layerCount = parseInt(visualization.layerCount.toString());
                visualizationJson.size = parseInt(visualization.size.toString());

                PetJsonMapper.mapVisualizationLayerXML(visualization, visualizationJson);
                PetJsonMapper.mapVisualizationDirectionXML(visualization, visualizationJson);
                PetJsonMapper.mapVisualizationColorXML(visualization, visualizationJson);
                PetJsonMapper.mapVisualizationAnimationXML(visualization, visualizationJson);
                PetJsonMapper.mapVisualizationPostureXML(visualization, visualizationJson);
                PetJsonMapper.mapVisualizationGestureXML(visualization, visualizationJson);

                visualizationsArray.push(visualizationJson);
            }
        }

        output.visualizations = visualizationsArray;
    }

    private static mapVisualizationLayerXML(visXML: VisualizationXML, output: Visualization) {
        if (visXML.layers.length > 0) {
            output.layers = PetJsonMapper.mapVisualizationLayersXML(visXML.layers);
        }
    }

    private static mapVisualizationLayersXML(layersXML: Array<LayerXML>): VisualizationLayers {
        const layers: VisualizationLayers = {};
        for (const layerXML of layersXML) {
            const layer: Layer = {} as any;
            if (layer.alpha !== undefined)
                layer.alpha = parseInt(layerXML.alpha.toString());
            layer.ink = layerXML.ink;
            layer.tag = layerXML.tag;

            if (layerXML.x !== undefined)
                layer.x = parseInt(layerXML.x.toString());
            if (layerXML.y !== undefined)
                layer.y = parseInt(layerXML.y.toString());
            if (layerXML.z !== undefined)
                layer.z = parseInt(layerXML.z.toString());
            layer.ignoreMouse = layerXML.ignoreMouse as any;

            layers[layerXML.id] = layer;
        }

        return layers;
    }

    private static mapVisualizationDirectionXML(visXML: VisualizationXML, output: Visualization) {
        if (visXML.directions.length > 0) {
            const directions: Directions = {} as any;
            for (const directionXML of visXML.directions) {
                const direction: Direction = {} as any;
                if (directionXML.layers.length > 0) {
                    direction.layers = PetJsonMapper.mapVisualizationLayersXML(directionXML.layers);
                }

                directions[directionXML.id] = direction;
            }

            if (Object.keys(directions).length > 0) {
                output.directions = directions;
            }
        }
    }

    private static mapVisualizationColorXML(visXML: VisualizationXML, output: Visualization) {
        if (visXML.colors.length > 0) {
            const colors: Colors = {};
            for (const colorXML of visXML.colors) {
                if (colorXML.layers.length > 0) {
                    const color: Color = {} as any;
                    color.layers = PetJsonMapper.mapVisualizationColorLayerXML(colorXML);

                    colors[colorXML.id] = color;
                }
            }

            if (Object.keys(colors).length > 0) {
                output.colors = colors;
            }
        }
    }

    private static mapVisualizationColorLayerXML(colorXML: ColorXML): ColorLayers {
        const colorLayers: ColorLayers = {};
        for (const colorLayerXML of colorXML.layers) {
            const colorLayer: ColorLayer = {} as any;
            colorLayer.color = parseInt(colorLayerXML.color, 16);

            colorLayers[colorLayerXML.id] = colorLayer;
        }

        return colorLayers;
    }

    private static mapVisualizationAnimationXML(visXML: VisualizationXML, output: Visualization) {
        if (visXML.animations.length > 0) {
            const animations: Animations = {};
            for (const animationXML of visXML.animations) {
                if (animationXML.layers.length > 0) {
                    const animation: Animation = {} as any;

                    if (animationXML.transitionTo !== undefined)
                        animation.transitionTo = parseInt(animationXML.transitionTo.toString());
                    if (animationXML.transitionFrom !== undefined)
                        animation.transitionFrom = parseInt(animationXML.transitionFrom.toString());
                    animation.immediateChangeFrom = animationXML.immediateChangeFrom;

                    animation.layers = PetJsonMapper.mapVisualizationAnimationLayerXML(animationXML);

                    animations[animationXML.id] = animation;
                }
            }

            if (Object.keys(animations).length > 0) {
                output.animations = animations;
            }
        }
    }

    private static mapVisualizationAnimationLayerXML(animationXML: AnimationXML): AnimationLayers {
        const animationLayers: AnimationLayers = {};
        for (const animationLayerXML of animationXML.layers) {
            const animationLayer: AnimationLayer = {} as any;
            if (animationLayerXML.frameRepeat !== undefined)
                animationLayer.frameRepeat = parseInt(animationLayerXML.frameRepeat.toString());
            if (animationLayerXML.loopCount !== undefined)
                animationLayer.loopCount = parseInt(animationLayerXML.loopCount.toString());
            if (animationLayerXML.random !== undefined)
                animationLayer.random = parseInt(animationLayerXML.random.toString());

            if (animationLayerXML.frameSequences.length > 0) {
                animationLayer.frameSequences = PetJsonMapper.mapVisualizationFrameSequenceXML(animationLayerXML);
                animationLayers[animationLayerXML.id] = animationLayer;
            }
        }

        return animationLayers;
    }

    private static mapVisualizationFrameSequenceXML(animationLayerXML: AnimationLayerXML): FrameSequences {
        const frameSequences: FrameSequences = {};
        let frameSequenceCount = 0;
        for (const frameSequenceXML of animationLayerXML.frameSequences) {
            const frameSequence: FrameSequence = {} as any;

            if (frameSequenceXML.frames.length > 0) {
                let frameId = 0;
                const frames: Frames = {};
                for (const frameXML of frameSequenceXML.frames) {
                    const frame: Frame = {} as any;
                    if (frameXML.x !== undefined)
                        frame.x = parseInt(frameXML.x.toString());
                    if (frameXML.y !== undefined)
                        frame.y = parseInt(frameXML.y.toString());
                    if (frameXML.randomX !== undefined)
                        frame.randomX = parseInt(frameXML.randomX.toString());
                    if (frameXML.randomY !== undefined)
                        frame.randomY = parseInt(frameXML.randomY.toString());
                    if (frameXML.id === "NaN") {
                        frame.id = 0;
                    } else {
                        frame.id = parseInt(frameXML.id);
                    }
                    if (frameXML.offsets.length > 0) {
                        const offsets: Array<Offset> = new Array<Offset>();
                        for (const offsetXML of frameXML.offsets) {
                            const offset: Offset = {} as any;
                            offset.direction = parseInt(offsetXML.direction.toString());
                            if (offsetXML.x !== undefined)
                                offset.x = parseInt(offsetXML.x.toString());
                            if (offsetXML.y !== undefined)
                                offset.y = parseInt(offsetXML.y.toString());
                            offsets.push(offset);
                        }
                        frame.offsets = offsets;
                    }
                    frames[frameId] = frame;
                    frameId++;
                }
                if (frameSequenceXML.loopCount !== undefined)
                    frameSequence.loopCount = parseInt(frameSequenceXML.loopCount.toString());
                if (frameSequenceXML.random !== undefined)
                    frameSequence.random = parseInt(frameSequenceXML.random.toString());
                frameSequence.frames = frames;
                frameSequences[frameSequenceCount] = frameSequence;
            }
            frameSequenceCount++;
        }

        return frameSequences;
    }

    private static mapVisualizationPostureXML(visXML: VisualizationXML, output: Visualization) {
        if (visXML.postures.length > 0) {
            const postures: Postures = {};
            for (const postureXML of visXML.postures) {
                const posture: Posture = {} as any;
                posture.id = postureXML.id;
                posture.animationId = parseInt(postureXML.animationId.toString());

                postures[postureXML.id] = posture;
            }

            if (Object.keys(postures).length > 0) {
                output.postures = postures;
            }
        }
    }

    private static mapVisualizationGestureXML(visXML: VisualizationXML, output: Visualization) {
        if (visXML.gestures.length > 0) {
            const gestures: Gestures = {};
            for (const gestureXML of visXML.gestures) {
                const gesture: Gesture = {} as any;
                gesture.id = gestureXML.id;
                gesture.animationId = parseInt(gestureXML.animationId.toString());
                gestures[gestureXML.id] = gesture;
            }

            if (Object.keys(gestures).length > 0) {
                output.gestures = gestures;
            }
        }
    }
}