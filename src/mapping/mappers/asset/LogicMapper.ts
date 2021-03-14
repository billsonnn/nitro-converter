import {IAssetData} from '../../json';
import {LogicXML} from '../../xml';
import {Mapper} from './Mapper';
import {ISoundSample} from "../../json/asset/ISoundSample";

export class LogicMapper extends Mapper
{
    public static mapXML(logic: any, output: IAssetData): void
    {
        if(!logic || !output) return;

        LogicMapper.mapLogicXML(new LogicXML(logic.objectData), output);
    }

    private static mapLogicXML(xml: LogicXML, output: IAssetData): void
    {
        if(!xml || !output) return;

        if(xml.model !== undefined)
        {
            if(xml.model.dimensions !== undefined)
            {
                output.dimensions = {
                    x: xml.model.dimensions.x,
                    y: xml.model.dimensions.y,
                    z: xml.model.dimensions.z
                };
            }

            if(xml.model.directions !== undefined)
            {
                const directions: number[] = [];

                if(!xml.model.directions.length)
                {
                    directions.push(0);
                }
                else
                {
                    for(const direction of xml.model.directions) directions.push(parseInt(direction.id.toString()));
                }

                output.directions = directions;
            }
        }

        if(xml.action !== undefined)
        {
            if(xml.action.link !== undefined)
            {
                if(!output.action) output.action = {};

                output.action.link = xml.action.link;
            }

            if(xml.action.startState !== undefined)
            {
                if(!output.action) output.action = {};

                output.action.startState = xml.action.startState;
            }
        }

        if(xml.mask !== undefined) output.maskType = xml.mask.type;

        if(xml.credits !== undefined) output.credits = xml.credits.value;

        if(xml.soundSample !== undefined)
        {
            output.soundSample = {
                id: xml.soundSample.id,
                noPitch: xml.soundSample.noPitch
            };
        }
    }
}
