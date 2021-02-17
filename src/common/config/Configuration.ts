import { singleton } from 'tsyringe';
import * as configuration from '../../configuration.json';
import { FileUtilities } from '../../utils/FileUtilities';

@singleton()
export class Configuration
{
    private readonly _config: Map<string, string>;

    constructor()
    {
        this._config = new Map<string, string>();
    }

    public async init(): Promise<void>
    {
        for(const key of Object.keys(configuration)) this._config.set(key, configuration[key]);
    }

    public async loadExternalVariables(): Promise<void>
    {
        const url = this.getValue('external_vars.url');

        try
        {
            const content = await FileUtilities.readFileAsString(url);
            const config: string[] = content.split('\n');

            for(const configEntry of config)
            {
                const configEntrySplit = configEntry.split('=');
                const configKey = configEntrySplit[0];
                const configValue = configEntrySplit[1];

                this._config.set(configKey, configValue);
            }
        }

        catch (error)
        {
            console.log();
            console.error(error);
        }
    }

    public getBoolean(key: string): boolean
    {
        return this._config.get(key) === '1';
    }

    public getValue(key: string, value: string = ''): string
    {
        if(this._config.has(key))
        {
            // @ts-ignore
            return this._config.get(key);
        }

        return value;
    }
}
