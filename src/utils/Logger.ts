import { WriteStream } from 'fs';
import { singleton } from 'tsyringe';

@singleton()
export class Logger
{
    private _fileName: string = `error-${ Date.now() }.log`;
    private _writeStream: WriteStream = null;

    constructor()
    {

    }

    public logError(message: string): void
    {
        //
    }
}
