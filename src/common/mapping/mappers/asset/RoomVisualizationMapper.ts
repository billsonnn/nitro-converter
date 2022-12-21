import { IAssetData, IAssetPlane, IAssetPlaneMaskVisualization, IAssetPlaneVisualizationData } from '../../json';
import { IAssetPlaneMask } from '../../json/asset/room-visualization/IAssetPlaneMask';
import { IAssetPlaneMaskData } from '../../json/asset/room-visualization/IAssetPlaneMaskData';
import { IAssetPlaneMaterial } from '../../json/asset/room-visualization/IAssetPlaneMaterial';
import { IAssetPlaneMaterialCell } from '../../json/asset/room-visualization/IAssetPlaneMaterialCell';
import { IAssetPlaneMaterialCellColumn } from '../../json/asset/room-visualization/IAssetPlaneMaterialCellColumn';
import { IAssetPlaneMaterialCellMatrix } from '../../json/asset/room-visualization/IAssetPlaneMaterialCellMatrix';
import { IAssetPlaneTexture } from '../../json/asset/room-visualization/IAssetPlaneTexture';
import { IAssetPlaneTextureBitmap } from '../../json/asset/room-visualization/IAssetPlaneTextureBitmap';
import { IAssetPlaneVisualization } from '../../json/asset/room-visualization/IAssetPlaneVisualization';
import { IAssetPlaneVisualizationAnimatedLayer } from '../../json/asset/room-visualization/IAssetPlaneVisualizationAnimatedLayer';
import { IAssetPlaneVisualizationAnimatedLayerItem } from '../../json/asset/room-visualization/IAssetPlaneVisualizationAnimatedLayerItem';
import { IAssetPlaneVisualizationLayer } from '../../json/asset/room-visualization/IAssetPlaneVisualizationLayer';
import { PlaneMaskVisualizationDataXML, PlaneMaterialCellColumnXML, PlaneMaterialCellMatrixXML, PlaneMaterialCellXML, PlaneMaterialXML, PlaneTextureBitmapXML, PlaneTextureXML, PlaneVisualizationAnimatedLayerItemXML, PlaneVisualizationAnimatedLayerXML, PlaneVisualizationDataXML, PlaneVisualizationLayerXML, PlaneVisualizationXML, PlaneXML, RoomVisualizationXML } from '../../xml';
import { Mapper } from './Mapper';

export class RoomVisualizationMapper extends Mapper
{
    public static mapXML(visualization: any, output: IAssetData): void
    {
        if (!visualization || !output) return;

        RoomVisualizationMapper.mapVisualizationXML(new RoomVisualizationXML(visualization.visualizationData), output)
    }

    private static mapVisualizationXML(xml: RoomVisualizationXML, output: IAssetData): void
    {
        if (!xml || !output) return;

        output.roomVisualization = {};

        if (xml.floorData !== undefined)
        {
            if (xml.floorData)
            {
                output.roomVisualization.floorData = {};

                RoomVisualizationMapper.mapPlaneVisualizationDataXML(xml.floorData, output.roomVisualization.floorData);
            }
        }

        if (xml.wallData !== undefined)
        {
            if (xml.wallData)
            {
                output.roomVisualization.wallData = {};

                RoomVisualizationMapper.mapPlaneVisualizationDataXML(xml.wallData, output.roomVisualization.wallData);
            }
        }

        if (xml.landscapeData !== undefined)
        {
            if (xml.landscapeData)
            {
                output.roomVisualization.landscapeData = {};

                RoomVisualizationMapper.mapPlaneVisualizationDataXML(xml.landscapeData, output.roomVisualization.landscapeData);
            }
        }

        if (xml.landscapeData !== undefined)
        {
            if (xml.landscapeData)
            {
                output.roomVisualization.landscapeData = {};

                RoomVisualizationMapper.mapPlaneVisualizationDataXML(xml.landscapeData, output.roomVisualization.landscapeData);
            }
        }

        if (xml.maskData !== undefined)
        {
            if (xml.maskData)
            {
                output.roomVisualization.maskData = {};

                RoomVisualizationMapper.mapPlaneMaskData(xml.maskData, output.roomVisualization.maskData);
            }
        }
    }

    private static mapPlaneVisualizationDataXML(xml: PlaneVisualizationDataXML, output: IAssetPlaneVisualizationData): void
    {
        if (!xml || !output) return;

        if (xml.planes !== undefined)
        {
            if (xml.planes.length)
            {
                output.planes = [];

                RoomVisualizationMapper.mapPlanes(xml.planes, output.planes);
            }
        }

        if (xml.materials !== undefined)
        {
            if (xml.materials.length)
            {
                output.materials = [];

                RoomVisualizationMapper.mapMaterials(xml.materials, output.materials);
            }
        }

        if (xml.textures !== undefined)
        {
            if (xml.textures.length)
            {
                output.textures = [];

                RoomVisualizationMapper.mapTextures(xml.textures, output.textures);
            }
        }
    }

    private static mapPlanes(xml: PlaneXML[], output: IAssetPlane[]): void
    {
        if (!xml || !output) return;

        for (const planeXML of xml)
        {
            const plane: IAssetPlane = {};

            if (planeXML.id !== undefined) plane.id = planeXML.id;

            if (planeXML.visualizations !== undefined)
            {
                if (planeXML.visualizations.length)
                {
                    plane.visualizations = [];

                    RoomVisualizationMapper.mapPlaneVisualizationsXML(planeXML.visualizations, plane.visualizations);
                }
            }

            if (planeXML.animatedVisualization !== undefined)
            {
                if (planeXML.animatedVisualization.length)
                {
                    plane.animatedVisualization = [];

                    RoomVisualizationMapper.mapPlaneVisualizationsXML(planeXML.animatedVisualization, plane.animatedVisualization);
                }
            }

            output.push(plane);
        }
    }

    private static mapPlaneVisualizationsXML(xml: PlaneVisualizationXML[], output: IAssetPlaneVisualization[]): void
    {
        if (!xml || !output) return;

        for (const planeVisualizationXML of xml)
        {
            const visualization: IAssetPlaneVisualization = {};

            if (planeVisualizationXML.size !== undefined) visualization.size = planeVisualizationXML.size;

            if (planeVisualizationXML.horizontalAngle !== undefined) visualization.horizontalAngle = planeVisualizationXML.horizontalAngle;
            if (planeVisualizationXML.verticalAngle !== undefined) visualization.verticalAngle = planeVisualizationXML.verticalAngle;

            if (planeVisualizationXML.layers !== undefined)
            {
                if (planeVisualizationXML.layers.length)
                {
                    visualization.layers = [];

                    RoomVisualizationMapper.mapPlaneVisualizationLayers(planeVisualizationXML.layers, visualization.layers);
                }
            }

            if (planeVisualizationXML.animatedLayers !== undefined)
            {
                if (planeVisualizationXML.animatedLayers.length)
                {
                    visualization.animatedLayers = [];

                    RoomVisualizationMapper.mapPlaneVisualizationAnimatedLayers(planeVisualizationXML.animatedLayers, visualization.animatedLayers);
                }
            }

            output.push(visualization);
        }
    }

    private static mapPlaneVisualizationLayers(xml: PlaneVisualizationLayerXML[], output: IAssetPlaneVisualizationLayer[]): void
    {
        if (!xml || !output) return;

        for (const planeVisualizationLayerXML of xml)
        {
            const layer: IAssetPlaneVisualizationLayer = {};

            if (planeVisualizationLayerXML.materialId !== undefined) layer.materialId = planeVisualizationLayerXML.materialId;
            if (planeVisualizationLayerXML.color !== undefined) layer.color = planeVisualizationLayerXML.color;
            if (planeVisualizationLayerXML.offset !== undefined) layer.offset = planeVisualizationLayerXML.offset;
            if (planeVisualizationLayerXML.align !== undefined) layer.align = planeVisualizationLayerXML.align;

            output.push(layer);
        }
    }

    private static mapPlaneVisualizationAnimatedLayers(xml: PlaneVisualizationAnimatedLayerXML[], output: IAssetPlaneVisualizationAnimatedLayer[]): void
    {
        if (!xml || !output) return;

        for (const planeVisualizationAnimatedLayerXML of xml)
        {
            const animatedLayer: IAssetPlaneVisualizationAnimatedLayer = {};

            if (planeVisualizationAnimatedLayerXML.items !== undefined)
            {
                if (planeVisualizationAnimatedLayerXML.items.length)
                {
                    animatedLayer.items = [];

                    RoomVisualizationMapper.mapPlaneVisualizationAnimatedLayerItems(planeVisualizationAnimatedLayerXML.items, animatedLayer.items);
                }
            }

            output.push(animatedLayer);
        }
    }

    private static mapPlaneVisualizationAnimatedLayerItems(xml: PlaneVisualizationAnimatedLayerItemXML[], output: IAssetPlaneVisualizationAnimatedLayerItem[]): void
    {
        if (!xml || !output) return;

        for (const planeVisualizationAnimatedLayerItemXML of xml)
        {
            const layerItem: IAssetPlaneVisualizationAnimatedLayerItem = {};

            if (planeVisualizationAnimatedLayerItemXML.id !== undefined) layerItem.id = planeVisualizationAnimatedLayerItemXML.id;
            if (planeVisualizationAnimatedLayerItemXML.assetId !== undefined) layerItem.assetId = planeVisualizationAnimatedLayerItemXML.assetId;
            if (planeVisualizationAnimatedLayerItemXML.x !== undefined) layerItem.x = planeVisualizationAnimatedLayerItemXML.x;
            if (planeVisualizationAnimatedLayerItemXML.y !== undefined) layerItem.y = planeVisualizationAnimatedLayerItemXML.y;
            if (planeVisualizationAnimatedLayerItemXML.randomX !== undefined) layerItem.randomX = planeVisualizationAnimatedLayerItemXML.randomX;
            if (planeVisualizationAnimatedLayerItemXML.randomY !== undefined) layerItem.randomY = planeVisualizationAnimatedLayerItemXML.randomY;
            if (planeVisualizationAnimatedLayerItemXML.speedX !== undefined) layerItem.speedX = planeVisualizationAnimatedLayerItemXML.speedX;
            if (planeVisualizationAnimatedLayerItemXML.speedY !== undefined) layerItem.speedY = planeVisualizationAnimatedLayerItemXML.speedY;

            output.push(layerItem);
        }
    }

    private static mapMaterials(xml: PlaneMaterialXML[], output: IAssetPlaneMaterial[]): void
    {
        if (!xml || !output) return;

        for (const planeMaterialXML of xml)
        {
            const planeMaterial: IAssetPlaneMaterial = {};

            if (planeMaterialXML.id !== undefined) planeMaterial.id = planeMaterialXML.id;

            if (planeMaterialXML.matrices !== undefined)
            {
                if (planeMaterialXML.matrices.length)
                {
                    planeMaterial.matrices = [];

                    RoomVisualizationMapper.mapMaterialCellMatrices(planeMaterialXML.matrices, planeMaterial.matrices);
                }
            }

            output.push(planeMaterial);
        }
    }

    private static mapMaterialCellMatrices(xml: PlaneMaterialCellMatrixXML[], output: IAssetPlaneMaterialCellMatrix[]): void
    {
        if (!xml || !output) return;

        for (const planeMaterialCellMatrixXML of xml)
        {
            const planeMaterialCellMatrix: IAssetPlaneMaterialCellMatrix = {};

            if (planeMaterialCellMatrixXML.repeatMode !== undefined) planeMaterialCellMatrix.repeatMode = planeMaterialCellMatrixXML.repeatMode;
            if (planeMaterialCellMatrixXML.align !== undefined) planeMaterialCellMatrix.align = planeMaterialCellMatrixXML.align;
            if (planeMaterialCellMatrixXML.normalMinX !== undefined) planeMaterialCellMatrix.normalMinX = planeMaterialCellMatrixXML.normalMinX;
            if (planeMaterialCellMatrixXML.normalMaxX !== undefined) planeMaterialCellMatrix.normalMaxX = planeMaterialCellMatrixXML.normalMaxX;
            if (planeMaterialCellMatrixXML.normalMinY !== undefined) planeMaterialCellMatrix.normalMinY = planeMaterialCellMatrixXML.normalMinY;
            if (planeMaterialCellMatrixXML.normalMaxY !== undefined) planeMaterialCellMatrix.normalMaxY = planeMaterialCellMatrixXML.normalMaxY;

            if (planeMaterialCellMatrixXML.columns !== undefined)
            {
                if (planeMaterialCellMatrixXML.columns.length)
                {
                    planeMaterialCellMatrix.columns = [];

                    RoomVisualizationMapper.mapMaterialCellColumns(planeMaterialCellMatrixXML.columns, planeMaterialCellMatrix.columns);
                }
            }

            output.push(planeMaterialCellMatrix);
        }
    }

    private static mapMaterialCellColumns(xml: PlaneMaterialCellColumnXML[], output: IAssetPlaneMaterialCellColumn[]): void
    {
        if (!xml || !output) return;

        for (const planeMaterialCellColumnXML of xml)
        {
            const planeMaterialCellColumn: IAssetPlaneMaterialCellColumn = {};

            if (planeMaterialCellColumnXML.repeatMode !== undefined) planeMaterialCellColumn.repeatMode = planeMaterialCellColumnXML.repeatMode;
            if (planeMaterialCellColumnXML.width !== undefined) planeMaterialCellColumn.width = planeMaterialCellColumnXML.width;

            if (planeMaterialCellColumnXML.cells !== undefined)
            {
                if (planeMaterialCellColumnXML.cells.length)
                {
                    planeMaterialCellColumn.cells = [];

                    RoomVisualizationMapper.mapMaterialCells(planeMaterialCellColumnXML.cells, planeMaterialCellColumn.cells);
                }
            }

            output.push(planeMaterialCellColumn);
        }
    }

    private static mapMaterialCells(xml: PlaneMaterialCellXML[], output: IAssetPlaneMaterialCell[]): void
    {
        if (!xml || !output) return;

        for (const planeMaterialCellXML of xml)
        {
            const planeMaterialCell: IAssetPlaneMaterialCell = {};

            if (planeMaterialCellXML.textureId !== undefined) planeMaterialCell.textureId = planeMaterialCellXML.textureId;

            if (planeMaterialCellXML.extraData !== undefined)
            {
                planeMaterialCell.extraData = {};

                if (planeMaterialCellXML.extraData.limitMax !== undefined) planeMaterialCell.extraData.limitMax = planeMaterialCellXML.extraData.limitMax;
                if (planeMaterialCellXML.extraData.extraItemTypes !== undefined) planeMaterialCell.extraData.extraItemTypes = planeMaterialCellXML.extraData.extraItemTypes;
                if (planeMaterialCellXML.extraData.offsets !== undefined) planeMaterialCell.extraData.offsets = planeMaterialCellXML.extraData.offsets;
            }

            output.push(planeMaterialCell);
        }
    }

    private static mapTextures(xml: PlaneTextureXML[], output: IAssetPlaneTexture[]): void
    {
        if (!xml || !output) return;

        for (const planeTextureXML of xml)
        {
            const planeTexture: IAssetPlaneTexture = {};

            if (planeTextureXML.id !== undefined) planeTexture.id = planeTextureXML.id;

            if (planeTextureXML.bitmaps !== undefined)
            {
                if (planeTextureXML.bitmaps.length)
                {
                    planeTexture.bitmaps = [];

                    RoomVisualizationMapper.mapTextureBitmaps(planeTextureXML.bitmaps, planeTexture.bitmaps);
                }
            }

            output.push(planeTexture);
        }
    }

    private static mapTextureBitmaps(xml: PlaneTextureBitmapXML[], output: IAssetPlaneTextureBitmap[]): void
    {
        if (!xml || !output) return;

        for (const planeTextureBitmapXML of xml)
        {
            const planeTextureBitmap: IAssetPlaneTextureBitmap = {};

            if (planeTextureBitmapXML.assetName !== undefined) planeTextureBitmap.assetName = planeTextureBitmapXML.assetName;
            if (planeTextureBitmapXML.normalMinX !== undefined) planeTextureBitmap.normalMinX = planeTextureBitmapXML.normalMinX;
            if (planeTextureBitmapXML.normalMaxX !== undefined) planeTextureBitmap.normalMaxX = planeTextureBitmapXML.normalMaxX;
            if (planeTextureBitmapXML.normalMinY !== undefined) planeTextureBitmap.normalMinY = planeTextureBitmapXML.normalMinY;
            if (planeTextureBitmapXML.normalMaxY !== undefined) planeTextureBitmap.normalMaxY = planeTextureBitmapXML.normalMaxY;

            output.push(planeTextureBitmap);
        }
    }

    private static mapPlaneMaskData(xml: PlaneMaskVisualizationDataXML, output: IAssetPlaneMaskData): void
    {
        if (!xml || !output) return;

        if ((xml.masks !== undefined) && Array.isArray(xml.masks))
        {
            output.masks = [];

            for (const planeMaskXML of xml.masks)
            {
                const planeMask: IAssetPlaneMask = {};

                if (planeMaskXML.id !== undefined) planeMask.id = planeMaskXML.id;

                if ((planeMaskXML.visualizations !== undefined) && planeMaskXML.visualizations.length)
                {
                    planeMask.visualizations = [];

                    for (const planeMaskVisualizationXML of planeMaskXML.visualizations)
                    {
                        const planeMaskVisualization: IAssetPlaneMaskVisualization = {};

                        if (planeMaskVisualizationXML.size !== undefined) planeMaskVisualization.size = planeMaskVisualizationXML.size;

                        if ((planeMaskVisualizationXML.bitmaps !== undefined) && planeMaskVisualizationXML.bitmaps.length)
                        {
                            planeMaskVisualization.bitmaps = [];

                            RoomVisualizationMapper.mapTextureBitmaps(planeMaskVisualizationXML.bitmaps, planeMaskVisualization.bitmaps);
                        }

                        planeMask.visualizations.push(planeMaskVisualization);
                    }
                }

                output.masks.push(planeMask);
            }
        }
    }
}
