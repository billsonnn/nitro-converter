import lzma from 'lzma-purejs';
import { promisify } from 'util';
import { unzip } from 'zlib';
import { ReadSWFBuff } from './ReadSWFBuffer';
import { SWFBuffer } from './SWFBuffer';

export const UncompressSWF = async (rawBuffer: Buffer) =>
{
    if(!Buffer.isBuffer(rawBuffer)) return null;

    const compressed_buff = rawBuffer.slice(8);

    switch(rawBuffer[0])
    {
        case 0x43: { // zlib compressed
            const buffer = await (promisify(unzip)(compressed_buff));

            if(!Buffer.isBuffer(buffer)) return null;

            return ReadSWFBuff(new SWFBuffer(buffer), rawBuffer);
        }
        case 0x46: // uncompressed
            return ReadSWFBuff(new SWFBuffer(rawBuffer), rawBuffer);
        case 0x5a: { // LZMA compressed
            const buffer = Buffer.concat([ rawBuffer.slice(0, 8), lzma.decompressFile(compressed_buff) ]);

            if(!Buffer.isBuffer(buffer)) return null;

            return ReadSWFBuff(new SWFBuffer(buffer), rawBuffer);
        }
    }

    return null;
};
