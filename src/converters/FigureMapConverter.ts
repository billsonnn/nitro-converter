import { writeFile } from 'fs/promises';
import ora from 'ora';
import { singleton } from 'tsyringe';
import { parseStringPromise } from 'xml2js';
import { Configuration, FigureMapMapper, FileUtilities, IConverter, IFigureMap } from '../common';

@singleton()
export class FigureMapConverter implements IConverter
{
    public figureMap: IFigureMap = null;

    constructor(
        private readonly _configuration: Configuration)
    {}

    public async convertAsync(): Promise<void>
    {
        const now = Date.now();
        const spinner = ora('Preparing FigureMap').start();
        const url = this._configuration.getValue('figuremap.load.url');
        const content = await FileUtilities.readFileAsString(url);

        this.figureMap = ((!content.startsWith('{')) ? await this.mapXML2JSON(await parseStringPromise(content.replace(/&/g,'&amp;'))) : JSON.parse(content));

        const directory = await FileUtilities.getDirectory('./assets/gamedata');
        const path = directory.path + '/FigureMap.json';

        await writeFile(path, JSON.stringify(this.figureMap), 'utf8');

        spinner.succeed(`FigureMap: Finished in ${ Date.now() - now }ms`);
    }

    private async mapXML2JSON(xml: any): Promise<IFigureMap>
    {
        if(!xml) return null;

        const output: IFigureMap = {};

        FigureMapMapper.mapXML(xml, output);

        return output;
    }
}
