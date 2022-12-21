import { IAssetData } from '../../json';
import { RoomVisualizationXML } from '../../xml';
import { Mapper } from './Mapper';

export class RoomVisualizationMapper extends Mapper
{
    public static mapXML(visualization: any, output: IAssetData): void
    {
        if (!visualization || !output) return;

        RoomVisualizationMapper.mapVisualizationXML(new RoomVisualizationXML(visualization.visualizationData), output);
    }

    private static mapVisualizationXML(xml: RoomVisualizationXML, output: IAssetData): void
    {
        if (!xml || !output) return;

        console.log(xml);
    }
}
