import { readFile } from 'fs';
import * as fetch from 'node-fetch';
import { promisify } from 'util';

const readFileAsync = promisify(readFile);

export class FileUtilities
{
    public static async readFileAsBuffer(url: string): Promise<Buffer>
    {
        if(!url) return null;

        let content: Buffer = null;

        try
        {
            if(url.startsWith('http'))
            {
                const data = await fetch.default(url);
                const arrayBuffer = await data.arrayBuffer();

                if(arrayBuffer) content = Buffer.from(arrayBuffer);
            }
            else
            {
                content = await readFileAsync(url);
            }

            return content;
        }

        catch (error)
        {
            console.log();
            console.error(error);
        }
    }

    public static async readFileAsString(url: string): Promise<string>
    {
        if(!url) return null;

        let content = null;

        try
        {
            if(url.startsWith('http'))
            {
                const data = await fetch.default(url);

                if(data) content = await data.text();
            }
            else
            {
                const data = await readFileAsync(url);

                content = data.toString('utf-8');
            }

            return content;
        }

        catch (error)
        {
            console.log();
            console.error(error);
        }
    }
}
