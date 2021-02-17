import { FigureLibraryXML } from './FigureLibraryXML';

export class FigureMapXML
{
    private _librares: FigureLibraryXML[];

    constructor(xml: any)
    {
        if(xml.map !== undefined)
        {
            if(xml.map.lib !== undefined)
            {
                this._librares = [];

                for(const lib in xml.map.lib)
                {
                    const library = xml.map.lib[lib];

                    this._librares.push(new FigureLibraryXML(library));
                }
            }
        }
    }

    public get libraries(): FigureLibraryXML[]
    {
        return this._librares;
    }
}
