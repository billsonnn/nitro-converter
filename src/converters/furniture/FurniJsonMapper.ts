import {
    Action,
    Direction,
    Directions,
    FurniAsset,
    FurniAssets,
    FurniJson,
    Layer,
    Visualization,
    VisualizationLayers
} from "./FurniTypes";
import SpriteSheetConverter from "../util/SpriteSheetConverter";

export default class FurniJsonMapper {
    private static readonly VISUALIZATION_DEFAULT_SIZE = 64;

    private static readonly VISUALIZATION_ICON_SIZE = 1;

    public mapXML(assetsXML: any, indexXML: any, logicXML: any, visualizationXML: any): FurniJson {
        const furniJson: FurniJson = {} as any;

        furniJson.assets = this.mapAssetsXML(assetsXML) as any;

        this.mapIndexXML(indexXML, furniJson);
        this.mapLogicXML(logicXML, furniJson);
        this.mapVisualizationXML(visualizationXML, furniJson);
        //console.log(furniJson);

        return furniJson;
    }


    private mapAssetsXML(assetsXML: any): FurniAssets | null {
        const assets: FurniAssets = {} as any;

        for (const asset of assetsXML.assets.asset) {
            const attributes = asset['$'];
            if (!attributes.name.includes("_32_")) {
                const furniAsset: FurniAsset = {} as any;

                if (attributes.source !== undefined) {
                    furniAsset.source = attributes.source;
                    if (SpriteSheetConverter.imageSource.has(attributes.source)) {
                        furniAsset.source = SpriteSheetConverter.imageSource.get(attributes.source) as string;
                    }
                }

                if (SpriteSheetConverter.imageSource.has(attributes.name)) {
                    furniAsset.source = SpriteSheetConverter.imageSource.get(attributes.name) as string;
                }

                furniAsset.x = attributes.x;
                furniAsset.y = attributes.y;
                furniAsset.flipH = attributes.flipH === "1";
                assets[attributes.name] = furniAsset;
            }
        }
        return Object.keys(assets).length > 0 ? assets : null;
    }

    private mapIndexXML(indexXML: any, output: FurniJson) {
        const attributes = indexXML.object['$'];
        output.name = attributes.type;
        output.logicType = attributes.logic;
        output.visualizationType = attributes.visualization;
    }

    private mapLogicXML(logicXML: any, output: FurniJson) {
        const objectData = logicXML.objectData;
        const attributes = objectData['$'];

        const model = objectData.model[0];
        const dimensions = model.dimensions[0]['$'];
        output.dimensions = {
            x: parseInt(dimensions.x),
            y: parseInt(dimensions.y),
            z: parseFloat(dimensions.z)
        }

        const directions: Array<number> = [];
        if (model.directions === undefined) {
            directions.push(0);
        } else {
            for (const directionObj of model.directions) {
                const direction = directionObj.direction;
                for (const dir of direction) {
                    const dirAttributes = dir['$'];
                    directions.push(dirAttributes);
                }
            }
        }

        if (model.action !== undefined) {
            const action: Action = {} as any;
        }

        output.directions = directions;
    }

    private mapVisualizationXML(visualizationXML: any, output: FurniJson) {
        const visualizationsArray: Visualization[] = [];

        const visualizationData = visualizationXML.visualizationData;
        const attributes = visualizationData['$'];

        const visualizations = visualizationData.graphics;
        for (const visualizationArr of visualizations) {
            for (const visualization of visualizationArr.visualization) {
                const attributes = visualization['$'];

                if (attributes.size == FurniJsonMapper.VISUALIZATION_DEFAULT_SIZE || attributes.size == FurniJsonMapper.VISUALIZATION_ICON_SIZE) {
                    const visualizationType: Visualization = {} as any;
                    visualizationType.angle = attributes.angle;
                    visualizationType.layerCount = attributes.layerCount;
                    visualizationType.size = attributes.size;

                    this.mapVisualizationLayersXML(visualization, visualizationType);
                    this.mapVisualizationDirectionXML(visualization, visualizationType);

                    visualizationsArray.push(visualizationType);
                }
            }
        }

        output.visualizations = visualizationsArray;
    }

    private mapVisualizationColorXML(visualization: any, visualizationType: Visualization) {
        if (visualization.colors !== undefined && visualization.colors.length > 0) {

        }
    }

    private mapVisualizationDirectionXML(visualization: any, visualizationType: Visualization) {
        if (visualization.directions !== undefined && visualization.directions.length > 0) {
            const directions: Directions = {} as any;
            for (const directionParent of visualization.directions) {
                for (const direction of directionParent.direction) {
                    const attributes = direction['$'];
                    const directionType: Direction = {} as any;
                    directionType.id = attributes.id;

                    if (direction.layers !== undefined && direction.layers.length > 0) {
                        directionType.layers = this.generateLayers(direction, visualizationType);
                    }

                    directions[directionType.id] = directionType;
                }
            }

            if (Object.keys(directions).length > 0) visualizationType.directions = directions;
        }
    }

    private mapVisualizationLayersXML(visualization: any, visualizationType: Visualization) {
        if (visualization.layers !== undefined && visualization.layers.length > 0) {
            for (const layerEntry of visualization.layers) {
                const layer = layerEntry.layer;
                visualizationType.layers = this.generateLayers(layer, visualizationType);
            }
        }
    }

    private generateLayers(visualization: any, visualizationType: Visualization): VisualizationLayers {
        const visualizationLayers: VisualizationLayers = {} as any;
        for (const layerEntry of visualization.layers) {
            const layer = layerEntry.layer;
            const layerAttributes = layer['$'];

            const layerType: Layer = {
                id: layerAttributes.id,
                alpha: layerAttributes.alpha,
                ink: layerAttributes.ink,
                tag: layerAttributes.tag,
                x: layerAttributes.x,
                y: layerAttributes.y,
                z: layerAttributes.z,
            } as any;
            if (layerAttributes.ignoreMouse !== undefined) layerType.ignoreMouse = layerAttributes.ignoreMouse === '1';

            visualizationLayers[layerAttributes.id] = layerType;
        }

        return visualizationLayers;
    }
}