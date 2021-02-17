import { createWriteStream, existsSync } from 'fs';
import { appendFile } from 'fs/promises';
import { singleton } from 'tsyringe';

@singleton()
export default class Logger
{

    constructor()
    {
        if(!existsSync('error.log'))
        {
            const createStream = createWriteStream('error.log');
            createStream.end();
        }
    }

    public logErrorAsync(message: string): Promise<void>
    {
        return appendFile('error.log', message + '\n');
    }
}
