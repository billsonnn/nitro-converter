import {
    Action,
    Animation,
    AnimationLayer,
    AnimationLayers,
    Animations,
    Color,
    ColorLayer,
    ColorLayers,
    Colors,
    Direction,
    Directions,
    Frame,
    Frames,
    FrameSequence,
    FrameSequences,
    FurniAsset,
    FurniAssets,
    FurniJson, Gesture, Gestures,
    Layer,
    Offset, Posture, Postures,
    Visualization,
    VisualizationLayers
} from "./FurniTypes";
import SpriteSheetConverter from "../util/SpriteSheetConverter";
import {AssetsXML, IndexXML, LogicXML} from "./FurniXMLTypes";
import {
    AnimationLayerXML,
    AnimationXML,
    ColorXML,
    LayerXML,
    VisualizationDataXML,
    VisualizationXML
} from "./VisualizationXMLTypes";
import {log} from "util";

export default class FurniJsonMapper {
    private static readonly VISUALIZATION_DEFAULT_SIZE = 64;

    private static readonly VISUALIZATION_ICON_SIZE = 1;

    public mapXML(assets: any, indexXML: any, logic: any, visualization: any): FurniJson {
        const furniJson: FurniJson = {} as any;

        FurniJsonMapper.mapAssetsXML(new AssetsXML(assets), furniJson);
        FurniJsonMapper.mapIndexXML(new IndexXML(indexXML.object), furniJson);
        FurniJsonMapper.mapLogicXML(new LogicXML(logic.objectData), furniJson);
        FurniJsonMapper.mapVisualizationXML(new VisualizationDataXML(visualization.visualizationData), furniJson);

        return furniJson;
    }


    private static mapAssetsXML(assetsXML: AssetsXML, output: FurniJson) {
        const assets: FurniAssets = {} as any;

        for (const asset of assetsXML.assets) {
            if (!asset.name.includes("_32_")) {
                const furniAsset: FurniAsset = {} as any;

                if (asset.source !== undefined) {
                    furniAsset.source = asset.source;
                    if (SpriteSheetConverter.imageSource.has(asset.source)) {
                        furniAsset.source = SpriteSheetConverter.imageSource.get(asset.source) as string;
                    }
                }

                if (SpriteSheetConverter.imageSource.has(asset.name)) {
                    furniAsset.source = SpriteSheetConverter.imageSource.get(asset.name) as string;
                }

                if (asset.x !== undefined)
                    furniAsset.x = parseInt(asset.x.toString());
                if (asset.y !== undefined)
                    furniAsset.y = parseInt(asset.y.toString());
                furniAsset.flipH = asset.flipH as any;
                assets[asset.name] = furniAsset;
            }
        }

        if (Object.keys(assets).length > 0) {
            output.assets = assets;
        }
    }

    private static mapIndexXML(indexXML: IndexXML, output: FurniJson) {
        output.name = indexXML.type;
        output.logicType = indexXML.logic;
        output.visualizationType = indexXML.visualization;
    }

    private static mapLogicXML(logicXML: LogicXML, output: FurniJson) {
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

        if (logicXML.action !== undefined) {
            const action: Action = {} as any;
            if (logicXML.action.link !== undefined) action.link = logicXML.action.link;
            if (logicXML.action.startState !== undefined) action.startState = logicXML.action.startState;

            output.action = action;
        }

        if (logicXML.mask !== undefined) {
            output.maskType = logicXML.mask.type;
        }

        if (logicXML.credits !== undefined) {
            output.credits = logicXML.credits.value;
        }

        output.directions = directions;
    }

    private static mapVisualizationXML(visualizationData: VisualizationDataXML, output: FurniJson) {
        const visualizationsArray: Array<Visualization> = new Array<Visualization>();

        for (const visualization of visualizationData.visualizations) {
            if (visualization.size == FurniJsonMapper.VISUALIZATION_DEFAULT_SIZE || visualization.size == FurniJsonMapper.VISUALIZATION_ICON_SIZE) {
                const visualizationJson: Visualization = {} as any;
                visualizationJson.angle = parseInt(visualization.angle.toString());
                visualizationJson.layerCount = parseInt(visualization.layerCount.toString());
                visualizationJson.size = parseInt(visualization.size.toString());

                FurniJsonMapper.mapVisualizationLayerXML(visualization, visualizationJson);
                FurniJsonMapper.mapVisualizationDirectionXML(visualization, visualizationJson);
                FurniJsonMapper.mapVisualizationColorXML(visualization, visualizationJson);
                FurniJsonMapper.mapVisualizationAnimationXML(visualization, visualizationJson);
                FurniJsonMapper.mapVisualizationPostureXML(visualization, visualizationJson);
                FurniJsonMapper.mapVisualizationGestureXML(visualization, visualizationJson);

                visualizationsArray.push(visualizationJson);
            }
        }

        output.visualizations = visualizationsArray;
    }

    private static mapVisualizationLayerXML(visXML: VisualizationXML, output: Visualization) {
        if (visXML.layers.length > 0) {
            output.layers = FurniJsonMapper.mapVisualizationLayersXML(visXML.layers);
        }
    }

    private static mapVisualizationLayersXML(layersXML: Array<LayerXML>): VisualizationLayers {
        const layers: VisualizationLayers = {};
        for (const layerXML of layersXML) {
            const layer: Layer = {} as any;
            layer.alpha = layerXML.alpha;
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
                    direction.layers = FurniJsonMapper.mapVisualizationLayersXML(directionXML.layers);
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
                    color.layers = FurniJsonMapper.mapVisualizationColorLayerXML(colorXML);

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

                    animation.layers = FurniJsonMapper.mapVisualizationAnimationLayerXML(animationXML);

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
            animationLayer.frameRepeat = animationLayerXML.frameRepeat;
            animationLayer.loopCount = animationLayerXML.loopCount;
            animationLayer.random = animationLayerXML.random;

            if (animationLayerXML.frameSequences.length > 0) {
                animationLayer.frameSequences = FurniJsonMapper.mapVisualizationFrameSequenceXML(animationLayerXML);
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
                    frame.x = frameXML.x;
                    frame.y = frameXML.y;
                    frame.randomX = frameXML.randomX;
                    frame.randomY = frameXML.randomY;
                    if (frameXML.id === "NaN") {
                        frame.id = 0;
                    } else {
                        frame.id = parseInt(frameXML.id);
                    }
                    if (frameXML.offsets.length > 0) {
                        const offsets: Array<Offset> = new Array<Offset>();
                        for (const offsetXML of frameXML.offsets) {
                            const offset: Offset = {} as any;
                            offset.direction = offsetXML.direction;
                            offset.x = offsetXML.x;
                            offset.y = offsetXML.y;
                            offsets.push(offset);
                        }
                        frame.offsets = offsets;
                    }
                    frames[frameId] = frame;
                    frameId++;
                }
                frameSequence.loopCount = frameSequenceXML.loopCount;
                frameSequence.random = frameSequenceXML.random;
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
                posture.animationId = postureXML.animationId;

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
                gesture.animationId = gestureXML.animationId;
                gestures[gestureXML.id] = gesture;
            }

            if (Object.keys(gestures).length > 0) {
                output.gestures = gestures;
            }
        }
    }
}