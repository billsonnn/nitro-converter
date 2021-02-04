const fs = require('fs/promises');
const fetch = require('node-fetch');

const config = require('../config.json');

export default class Configuration {

    private readonly _config: Map<string, string>;

    constructor() {
        this._config = new Map<string, string>();
    }

    async init() {
        for (const key of Object.keys(config)) {
            this._config.set(key, config[key]);
        }
    }

    public getBoolean(key: string): boolean {
        return this._config.get(key) === "1";
    }

    public getValue(key: string, value: string = ""): string {
        if (this._config.has(key)) {
            // @ts-ignore
            return this._config.get(key);
        }

        return value;
    }

    public async loadExternalVariables(): Promise<void> {
        const url = this.getValue("external_vars.url");
        const fetchData = await fetch(url);
        const textData = await fetchData.text();

        const config: string[] = textData.split("\n");
        for (const configEntry of config) {
            const configEntrySplit = configEntry.split("=");
            const configKey = configEntrySplit[0];
            const configValue = configEntrySplit[1];

            this._config.set(configKey, configValue);
        }
    }
}