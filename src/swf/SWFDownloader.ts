import { FileUtilities } from '../common';
import { HabboAssetSWF } from './HabboAssetSWF';

export class SWFDownloader
{
    public static USES_REVISION: boolean = true;
    public static LOG_DOWNLOADS: boolean = true;

    public static getDownloadUrl(baseUrl: string, className: string, revision: number): string
    {
        let url = baseUrl;

        if(!url || !url.length) return null;

        if(SWFDownloader.USES_REVISION && (revision > -1)) url = url.replace('%revision%', revision.toString());

        url = url.replace('%className%', className);

        return url;
    }

    public static async download(baseUrl: string, className: string, revision: number): Promise<HabboAssetSWF>
    {
        let url = baseUrl;

        if(!url || !url.length) return;

        if(SWFDownloader.USES_REVISION && (revision > -1)) url = url.replace('%revision%', revision.toString());

        url = url.replace('%className%', className);

        const habboAssetSWF = await this.extractSWF(url);

        if(!habboAssetSWF) return null;

        return habboAssetSWF;
    }

    public static async downloadFromUrl(url: string): Promise<HabboAssetSWF>
    {
        return await this.extractSWF(url);
    }

    public static async extractSWF(url: string): Promise<HabboAssetSWF>
    {
        const buffer = await FileUtilities.readFileAsBuffer(url);

        if(!buffer) return null;

        const habboAssetSWF = new HabboAssetSWF(buffer);

        await habboAssetSWF.setupAsync();

        return habboAssetSWF;
    }
}
