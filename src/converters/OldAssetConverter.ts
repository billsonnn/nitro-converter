import { writeFile } from 'fs/promises';
import { singleton } from 'tsyringe';
import { Configuration } from '../common/config/Configuration';
import { Converter } from '../common/converters/Converter';
import { File } from '../utils/File';
import { FileUtilities } from '../utils/FileUtilities';
import { Logger } from '../utils/Logger';
import { NitroBundle } from '../utils/NitroBundle';

@singleton()
export class OldAssetConverter extends Converter
{
    constructor(
        private readonly _configuration: Configuration,
        private readonly _logger: Logger)
    {
        super();
    }

    public async convertAsync(args: string[] = []): Promise<void>
    {
        if(args.shift() !== 'old-asset') return;

        const directory = FileUtilities.getDirectory(this._configuration.getValue('output.folder'), 'generic');
        const baseDirectory = FileUtilities.getDirectory(args.shift());

        for(const className of args)
        {
            try
            {
                const path = new File(directory.path + '/' + className + '.nitro');
                const jsonBuffer = await FileUtilities.readFileAsBuffer(baseDirectory.path + '/' + className + '/' + className + '.json');
                const imageBuffer = await FileUtilities.readFileAsBuffer(baseDirectory.path + '/' + className + '/' + className + '.png');
                const nitroBundle = new NitroBundle();

                nitroBundle.addFile((className + '.json'), jsonBuffer);
                nitroBundle.addFile((className + '.png'), imageBuffer);

                await writeFile(path.path, await nitroBundle.toBufferAsync());

                console.log('Finished converting: ' + className);
            }

            catch (error)
            {
                console.log('Error converting: ' + className);
            }
        }
    }
}
