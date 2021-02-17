import { packAsync } from 'free-tex-packer-core';
import { singleton } from 'tsyringe';
import { HabboAssetSWF } from '../../swf/HabboAssetSWF';
import { Configuration } from '../config/Configuration';
import { SpriteBundle } from './SpriteBundle';

@singleton()
export class BundleProvider
{
    public static PROHIBITED_SIZES: string[] = [];

    public static imageSource: Map<string, string> = new Map();

    constructor(private readonly _configuration: Configuration)
    {}

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

        const images: { path: string, contents: Buffer }[] = [];

        const imageTags = habboAssetSWF.imageTags();

        for(const imageTag of imageTags)
        {
            if(tags.includes(imageTag.characterID))
            {
                for(let i = 0; i < tags.length; i++)
                {
                    if(tags[i] != imageTag.characterID) continue;

                    if(names[i] == imageTag.className) continue;

                    let isProhibited = false;

                    for(const size of BundleProvider.PROHIBITED_SIZES)
                    {
                        if(imageTag.className.indexOf(size) >= 0)
                        {
                            isProhibited = true;

                            break;
                        }
                    }

                    if(isProhibited) continue;

                    BundleProvider.imageSource.set(names[i].substring(habboAssetSWF.getDocumentClass().length + 1), imageTag.className.substring(habboAssetSWF.getDocumentClass().length + 1));

                    images.push({
                        path: imageTag.className,
                        contents: imageTag.imgData
                    });
                }
            }

            let isProhibited = false;

            for(const size of BundleProvider.PROHIBITED_SIZES)
            {
                if(imageTag.className.indexOf(size) >= 0)
                {
                    isProhibited = true;

                    break;
                }
            }

            if(isProhibited) continue;

            images.push({
                path: imageTag.className,
                contents: imageTag.imgData
            });
        }

        if(!images.length) return null;

        return await this.packImages(habboAssetSWF.getDocumentClass(), images);
    }

    async packImages(documentClass: string, images: { path: string, contents: Buffer }[]): Promise<SpriteBundle>
    {
        try
        {
            const files = await packAsync(images, {
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

            if(!bundle.spritesheet) throw new Error('Failed to parse SpriteSheet. ' + images[0].path);

            if((bundle.spritesheet !== undefined) && (bundle.imageData !== undefined))
            {
                bundle.spritesheet.meta.image = bundle.imageData.name;
            }

            return bundle;
        }

        catch (error)
        {
            console.error('Image Packing Error', error);
        }

        return null;
    }
}
