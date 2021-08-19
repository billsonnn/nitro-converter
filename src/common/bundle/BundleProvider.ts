import { packAsync } from 'free-tex-packer-core';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import { ImageBundle } from './ImageBundle';
import { SpriteBundle } from './SpriteBundle';

export class BundleProvider
{
    public static imageSource: Map<string, string> = new Map();

    public static async generateSpriteSheet(habboAssetSWF: HabboAssetSWF, convertCase: boolean = false): Promise<SpriteBundle>
    {
        const tagList = habboAssetSWF.symbolTags();
        const names: string[] = [];
        const tags: number[] = [];

        let documentClass = habboAssetSWF.getDocumentClass();

        if(convertCase) documentClass = (documentClass.replace(/(?:^|\.?)([A-Z])/g, (x,y) => ('_' + y.toLowerCase().replace(/^_/, ''))));

        for(const tag of tagList)
        {
            names.push(...tag.names);
            tags.push(...tag.tags);
        }

        const imageBundle = new ImageBundle();

        const imageTags = habboAssetSWF.imageTags();

        for(const imageTag of imageTags)
        {
            if(tags.includes(imageTag.characterID))
            {
                for(let i = 0; i < tags.length; i++)
                {
                    if(tags[i] != imageTag.characterID) continue;

                    if(names[i] == imageTag.className) continue;

                    if(imageTag.className.startsWith('sh_')) continue;

                    if(imageTag.className.indexOf('_32_') >= 0) continue;

                    BundleProvider.imageSource.set(names[i].substring(documentClass.length + 1), imageTag.className.substring(documentClass.length + 1));
                }
            }

            if(imageTag.className.startsWith('sh_')) continue;

            if(imageTag.className.indexOf('_32_') >= 0) continue;

            let className = imageTag.className;

            if(convertCase) className = ((className.replace(/(?:^|\.?)([A-Z])/g, (x,y) => ('_' + y.toLowerCase().replace(/^_/, '')))).substring(1));

            imageBundle.addImage(className, imageTag.imgData);
        }

        if(!imageBundle.images.length) return null;

        return await this.packImages(documentClass, imageBundle, convertCase);
    }

    private static async packImages(documentClass: string, imageBundle: ImageBundle, convertCase: boolean = false): Promise<SpriteBundle>
    {
        const files = await packAsync(imageBundle.images, {
            textureName: (convertCase ? documentClass.substring(1) : documentClass),
            width: 3072,
            height: 2048,
            fixedSize: false,
            allowRotation: false,
            detectIdentical: true,
            allowTrim: true,
            //@ts-ignore
            exporter: 'Pixi'
        });

        const bundle = new SpriteBundle();

        for(const item of files)
        {
            if(item.name.endsWith('.json'))
            {
                bundle.spritesheet = JSON.parse(item.buffer.toString('utf8'));

                delete bundle.spritesheet.meta.app;
                delete bundle.spritesheet.meta.version;
            }
            else
            {
                bundle.imageData = {
                    name: item.name,
                    buffer: item.buffer
                };

                if(convertCase) bundle.imageData.name = (documentClass.replace(/(?:^|\.?)([A-Z])/g, (x,y) => ('_' + y.toLowerCase().replace(/^_/, '')))).substring(1);
            }
        }

        if((bundle.spritesheet !== undefined) && (bundle.imageData !== undefined)) bundle.spritesheet.meta.image = bundle.imageData.name;

        return bundle;
    }
}
