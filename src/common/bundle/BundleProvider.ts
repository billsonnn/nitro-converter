import { packAsync } from 'free-tex-packer-core';
import { singleton } from 'tsyringe';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import { ImageBundle } from './ImageBundle';
import { SpriteBundle } from './SpriteBundle';

@singleton()
export class BundleProvider
{
    public static imageSource: Map<string, string> = new Map();

    public async generateSpriteSheet(habboAssetSWF: HabboAssetSWF): Promise<SpriteBundle>
    {
        const tagList = habboAssetSWF.symbolTags();
        const names: string[] = [];
        const tags: number[] = [];

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

                    BundleProvider.imageSource.set(names[i].substring(habboAssetSWF.getDocumentClass().length + 1), imageTag.className.substring(habboAssetSWF.getDocumentClass().length + 1));
                }
            }

            if(imageTag.className.startsWith('sh_')) continue;

            if(imageTag.className.indexOf('_32_') >= 0) continue;

            imageBundle.addImage(imageTag.className, imageTag.imgData);
        }

        if(!imageBundle.images.length) return null;

        return await this.packImages(habboAssetSWF.getDocumentClass(), imageBundle);
    }

    async packImages(documentClass: string, imageBundle: ImageBundle): Promise<SpriteBundle>
    {
        const files = await packAsync(imageBundle.images, {
            textureName: documentClass,
            width: 3072,
            height: 2048,
            fixedSize: false,
            allowRotation: true,
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
            }
        }

        if((bundle.spritesheet !== undefined) && (bundle.imageData !== undefined)) bundle.spritesheet.meta.image = bundle.imageData.name;

        return bundle;
    }
}
