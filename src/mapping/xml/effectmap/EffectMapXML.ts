import { EffectLibraryXML } from './EffectLibraryXML';

export class EffectMapXML
{
    private _librares: EffectLibraryXML[];

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

                    this._librares.push(new EffectLibraryXML(library));
                }
            }
        }
    }

    public get libraries(): EffectLibraryXML[]
    {
        return this._librares;
    }
}
