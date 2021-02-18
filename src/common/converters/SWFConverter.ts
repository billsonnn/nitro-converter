import { wrap } from 'bytebuffer';
import { writeFile } from 'fs/promises';
import { parseStringPromise } from 'xml2js';
import { IAssetData } from '../../mapping/json';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import { DefineBinaryDataTag } from '../../swf/tags/DefineBinaryDataTag';
import { NitroBundle } from '../../utils/NitroBundle';
import { SpriteBundle } from '../bundle/SpriteBundle';

export class SWFConverter
{
    protected async fromHabboAsset(habboAssetSWF: HabboAssetSWF, outputFolder: string, type: string, assetData: IAssetData, spriteBundle: SpriteBundle): Promise<void>
    {
        if(spriteBundle && (spriteBundle.spritesheet !== undefined)) assetData.spritesheet = spriteBundle.spritesheet;

        const name = habboAssetSWF.getDocumentClass();
        const path = outputFolder + '/' + name + '.nitro';
        const nitroBundle = new NitroBundle();

        nitroBundle.addFile((name + '.json'), Buffer.from(JSON.stringify(assetData)));

        if(spriteBundle && (spriteBundle.imageData !== undefined)) nitroBundle.addFile(spriteBundle.imageData.name, spriteBundle.imageData.buffer);

        await writeFile(path, await nitroBundle.toBufferAsync());
    }

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

    protected static getPalette(habboAssetSWF: HabboAssetSWF, paletteName: string): [ number, number, number ][]
    {
        const binaryData = SWFConverter.getBinaryData(habboAssetSWF, paletteName, false);

        if(!binaryData || !binaryData.binaryDataBuffer) return null;

        const byteBuffer = wrap(binaryData.binaryDataBuffer);

        const paletteColors: [ number, number, number ][] = [];

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
}
