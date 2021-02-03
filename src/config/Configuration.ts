const fs = require('fs/promises');
const fetch = require('node-fetch');

export default class Configuration {

    private readonly _config: Map<string, string>;

    constructor() {
        this._config = new Map<string, string>();
    }

    async init() {
        const content = await fs.readFile("/home/user/git/nitro-asset-converter-node (copy)/config.ini");

        this.parseContent(content.toString("utf-8"));
    }

    private parseContent(content: string) {
        const config: string[] = content.split("\n");
        for (const configEntry of config) {
            const configEntrySplit = configEntry.split("=");
            const configKey = configEntrySplit[0];
            const configValue = configEntrySplit[1];

            this._config.set(configKey, configValue);
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

        this.parseContent(textData);
    }
}