import { wrap } from 'bytebuffer';
import { parseStringPromise } from 'xml2js';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import { DefineBinaryDataTag } from '../../swf/tags/DefineBinaryDataTag';

export class SWFConverter
{
    private static getBinaryData(habboAssetSWF: HabboAssetSWF, type: string, documentNameTwice: boolean): DefineBinaryDataTag
    {
        let binaryName  = habboAssetSWF.getFullClassName(type, documentNameTwice);
        let tag         = habboAssetSWF.getBinaryTagByName(binaryName);

        if(!tag)
        {
            binaryName  = habboAssetSWF.getFullClassNameSnake(type, documentNameTwice, true);
            tag         = habboAssetSWF.getBinaryTagByName(binaryName);
        }

        return tag;
    }

    protected static getPalette(habboAssetSWF: HabboAssetSWF, paletteName: string): [ number, number, number ][]
    {
        const binaryData = SWFConverter.getBinaryData(habboAssetSWF, paletteName, false);

        if(!binaryData || !binaryData.binaryDataBuffer) return null;
        
        const byteBuffer = wrap(binaryData.binaryDataBuffer);

        const paletteColors: [ number, number, number ][] = [];

        try
        {
            let R = 0;
            let G = 0;
            let B = 0;
            let counter = 1;

            while((binaryData.binaryDataBuffer.length - byteBuffer.offset) > 0)
            {
                if(counter == 1) R = byteBuffer.readUint8();

                else if(counter == 2) G = byteBuffer.readUint8();

                else if(counter == 3)
                {
                    B = byteBuffer.readUint8();
                    paletteColors.push([ R, G, B ]);

                    counter = 0;
                }

                counter++;
            }

            return paletteColors;
        }

        catch (err)
        {
            console.log(err);
        }

        return null;
    }

    protected static async getAssetsXML(habboAssetSWF: HabboAssetSWF): Promise<any>
    {
        const binaryData = SWFConverter.getBinaryData(habboAssetSWF, 'assets', true);

        if(!binaryData) return null;
        
        return await parseStringPromise(binaryData.binaryData);
    }

    protected static async getLogicXML(habboAssetSWF: HabboAssetSWF): Promise<any>
    {
        const binaryData = SWFConverter.getBinaryData(habboAssetSWF, 'logic', true);

        if(!binaryData) return null;
        
        return await parseStringPromise(binaryData.binaryData);
    }

    protected static async getIndexXML(habboAssetSWF: HabboAssetSWF): Promise<any>
    {
        const binaryData = SWFConverter.getBinaryData(habboAssetSWF, 'index', false);

        if(!binaryData) return null;
        
        return await parseStringPromise(binaryData.binaryData);
    }

    protected static async getVisualizationXML(habboAssetSWF: HabboAssetSWF): Promise<any>
    {
        const binaryData = SWFConverter.getBinaryData(habboAssetSWF, 'visualization', true);

        if(!binaryData) return null;
        
        return await parseStringPromise(binaryData.binaryData);
    }
}
