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

        if(url.startsWith('//')) url = ('https:' + url);

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

    public static async readFileAsString(url: string): Promise<string>
    {
        if(!url) return null;

        let content = null;

        if(url.startsWith('//')) url = ('https:' + url);

        if(url.startsWith('http'))
        {
            const data = await fetch.default(url);
            if (data.status === 404) return null;

            if(data) content = await data.text();
        }
        else
        {
            const data = await readFileAsync(url);

            content = data.toString('utf-8');
        }

        return content;
    }
}
