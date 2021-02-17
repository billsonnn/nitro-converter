import { singleton } from 'tsyringe';

const fs = require('fs');
const fsAsync = require('fs/promises');

@singleton()
export default class Logger
{

    constructor()
    {
        if(!fs.existsSync('error.log'))
        {
            const createStream = fs.createWriteStream('error.log');
            createStream.end();
        }
    }

    public logErrorAsync(message: string): Promise<void>
    {
        return fsAsync.appendFile('error.log', message + '\n');
    }
}