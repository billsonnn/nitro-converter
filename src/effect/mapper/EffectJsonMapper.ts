import HabboAssetSWF from "../../swf/HabboAssetSWF";
import {
    Add,
    Alias,
    Aliases,
    Animation,
    Animations,
    AssetJSON,
    AssetsJSON, Avatar,
    Bodypart, Direction, DirectionOffset,
    EffectJson,
    Frame,
    Fx, Item, Override, Remove, Shadow, Sprite
} from "./EffectTypes";
import {ManifestXML} from "./EffectManifestXMLTypes";
import {
    AnimationXML,
    BodyPartXML
} from "./EffectAnimationXMLTypes";
import {singleton} from "tsyringe";
import EffectDownloader from "../EffectDownloader";
import BundleProvider from "../../bundle/BundleProvider";

@singleton()
export default class EffectJsonMapper {
    public static readonly MUST_START_WITH: string = "h_";


    public mapXML(habboAssetSWF: HabboAssetSWF, manifest: any, animation: any): EffectJson {
        const name = habboAssetSWF.getDocumentClass();
        const result = {} as EffectJson;
        result.name = name;
        result.type = EffectDownloader.types.get(name) as string;
        this.mapManifestXML(new ManifestXML(manifest), result);
        EffectJsonMapper.mapAnimationXML(new AnimationXML(animation), result);

        return result;
    }

    private mapManifestXML(manifestXML: ManifestXML, output: EffectJson) {
        const assets: AssetsJSON = {};

        for (const assetXML of manifestXML.library.assets) {
            if (assetXML.name.startsWith(EffectJsonMapper.MUST_START_WITH)) {

                const asset: AssetJSON = {} as any;
                if (assetXML.param != undefined && assetXML.param.value !== undefined) {
                    asset.x = parseInt(assetXML.param.value.split(",")[0]);
                    asset.y = parseInt(assetXML.param.value.split(",")[1]);
                }
                if (BundleProvider.imageSource.has(assetXML.name)) {
                    asset.source = BundleProvider.imageSource.get(assetXML.name) as string;
                }

                assets[assetXML.name] = asset;
            }
        }

        output.assets = assets;

        if (manifestXML.library.aliases.length > 0 || BundleProvider.imageSource.size > 0) {
            const aliases: Aliases = {};
            for (const aliasXML of manifestXML.library.aliases) {
                if (aliasXML.name.startsWith(EffectJsonMapper.MUST_START_WITH)) {
                    const alias: Alias = {} as any;

                    alias.link = aliasXML.link;
                    if (aliasXML.fliph !== undefined)
                        alias.fliph = parseInt(aliasXML.fliph.toString());
                    if (aliasXML.flipv !== undefined)
                        alias.flipv = parseInt(aliasXML.flipv.toString());

                    aliases[aliasXML.name] = alias;
                }
            }

            output.aliases = aliases;
        }
    }

    private static mapAnimationXML(animationXML: AnimationXML, output: EffectJson) {
        const animations: Animations = {};
        const animation: Animation = {} as any;
        animation.name = animationXML.name;
        animation.desc = animationXML.desc;
        animation.resetOnToggle = animationXML.resetOnToggle as any;

        const frames: Array<Frame> = new Array<Frame>();
        const avatars: Array<Avatar> = new Array<Avatar>();
        const directions: Array<DirectionOffset> = new Array<DirectionOffset>();
        const shadows: Array<Shadow> = new Array<Shadow>();
        const adds: Array<Add> = new Array<Add>();
        const removes: Array<Remove> = new Array<Remove>();
        const sprites: Array<Sprite> = new Array<Sprite>();
        const overrides: Array<Override> = new Array<Override>();
        if (animationXML.frames.length > 0) {
            for (const frameXML of animationXML.frames) {
                const fxs: Array<Fx> = new Array<Fx>();
                const bodyparts: Array<Bodypart> = new Array<BodyPartXML>();

                const frame: Frame = {} as any;
                if (frameXML.fxs.length > 0) {
                    for (const fxXML of frameXML.fxs) {
                        const fx: Fx = {} as any;
                        fx.action = fxXML.action;

                        if (fxXML.dx !== undefined)
                            fx.dx = parseInt(fxXML.dx.toString());

                        if (fxXML.dy !== undefined)
                            fx.dy = parseInt(fxXML.dy.toString());

                        if (fxXML.dz !== undefined)
                            fx.dz = parseInt(fxXML.dz.toString());

                        if (fxXML.dd !== undefined)
                            fx.dd = parseInt(fxXML.dd.toString());

                        if (fxXML.frame !== undefined)
                            fx.frame = parseInt(fxXML.frame.toString());
                        fx.id = fxXML.id;

                        fxs.push(fx);
                    }
                }
                if (frameXML.bodyParts.length > 0) {
                    for (const bodypartXML of frameXML.bodyParts) {
                        const items: Array<Item> = new Array<Item>();
                        const bodypart: Bodypart = {} as any;
                        if (bodypartXML.items.length > 0) {
                            for (const itemXML of bodypartXML.items) {
                                const item: Item = {} as any;
                                item.id = itemXML.id;
                                item.base = itemXML.base;

                                items.push(item);
                            }
                        }
                        bodypart.action = bodypartXML.action;

                        if (bodypartXML.dx !== undefined)
                            bodypart.dx = parseInt(bodypartXML.dx.toString());

                        if (bodypartXML.dy !== undefined)
                            bodypart.dy = parseInt(bodypartXML.dy.toString());

                        if (bodypartXML.dz !== undefined)
                            bodypart.dz = parseInt(bodypartXML.dz.toString());

                        if (bodypartXML.dd !== undefined)
                            bodypart.dd = parseInt(bodypartXML.dd.toString());

                        if (bodypartXML.frame !== undefined)
                            bodypart.frame = parseInt(bodypartXML.frame.toString());
                        bodypart.id = bodypartXML.id;
                        bodypart.base = bodypartXML.base;
                        bodypart.items = items;

                        bodyparts.push(bodypart);
                    }
                }
                if (frameXML.repeats !== undefined) frame.repeats = parseInt(frameXML.repeats.toString());
                frame.fxs = fxs;
                frame.bodyparts = bodyparts;
                frames.push(frame);
            }
        }
        if (animationXML.avatars.length > 0) {
            for (const avatarXML of animationXML.avatars) {
                const avatar: Avatar = {} as any;
                avatar.background = avatarXML.background;
                avatar.foreground = avatarXML.foreground;

                if (avatarXML.ink !== undefined)
                    avatar.ink = parseInt(avatarXML.ink.toString());

                avatars.push(avatar);
            }
        }
        if (animationXML.directions.length > 0) {
            for (const directionXML of animationXML.directions) {
                const direction: DirectionOffset = {} as any;
                direction.offset = parseInt(directionXML.offset.toString());

                directions.push(direction);
            }
        }
        if (animationXML.shadows.length > 0) {
            for (const shadowXML of animationXML.shadows) {
                const shadow: Shadow = {} as any;
                shadow.id = shadowXML.id;

                shadows.push(shadow);
            }
        }
        if (animationXML.adds.length > 0) {
            for (const addXML of animationXML.adds) {
                const add: Add = {} as any;
                add.id = addXML.id;
                add.align = addXML.align;
                add.blend = addXML.blend;

                if (addXML.ink !== undefined)
                    add.ink = parseInt(addXML.ink.toString());
                add.base = addXML.base;

                adds.push(add);
            }
        }
        if (animationXML.removes.length > 0) {
            for (const removeXML of animationXML.removes) {
                const remove: Remove = {} as any;
                remove.id = removeXML.id;

                removes.push(remove);
            }
        }
        if (animationXML.sprites.length > 0) {
            for (const spriteXML of animationXML.sprites) {
                const sprite: Sprite = {} as any;
                const directions2: Array<Direction> = new Array<Direction>();
                if (spriteXML.directionList.length > 0) {
                    for (const directionXML of spriteXML.directionList) {
                        const direction: Direction = {} as any;
                        direction.id = parseInt(directionXML.id.toString());

                        if (directionXML.dx !== undefined)
                            direction.dx = parseInt(directionXML.dx.toString());

                        if (directionXML.dy !== undefined)
                            direction.dy = parseInt(directionXML.dy.toString());

                        if (directionXML.dz !== undefined)
                            direction.dz = parseInt(directionXML.dz.toString());

                        directions2.push(direction);
                    }
                }
                sprite.directionList = directions2;

                if (spriteXML.directions !== undefined)
                    sprite.directions = parseInt(spriteXML.directions.toString());
                sprite.id = spriteXML.id;

                if (spriteXML.ink !== undefined)
                    sprite.ink = parseInt(spriteXML.ink.toString());

                if (spriteXML.member !== undefined)
                    sprite.member = spriteXML.member;

                if (spriteXML.staticY !== undefined)
                    sprite.staticY = parseInt(spriteXML.staticY.toString());
                sprites.push(sprite);
            }
        }
        if (animationXML.overrides.length > 0) {
            for (const overrideXML of animationXML.overrides) {
                const override: Override = {} as any;
                override.name = overrideXML.name;
                override.override = overrideXML.override;
                if (overrideXML.frames.length > 0) {
                    const overrideFrames: Array<Frame> = new Array<Frame>();
                    for (const frameXML of overrideXML.frames) {
                        const fxs: Array<Fx> = new Array<Fx>();
                        const bodyparts: Array<Bodypart> = new Array<Bodypart>();
                        const frame: Frame = {} as any;
                        if (frameXML.fxs.length > 0) {
                            for (const fxXML of frameXML.fxs) {
                                const fx: Fx = {} as any;
                                fx.action = fxXML.action;
                                if (fxXML.dx !== undefined)
                                    fx.dx = parseInt(fxXML.dx.toString());
                                if (fxXML.dy !== undefined)
                                    fx.dy = parseInt(fxXML.dy.toString());
                                if (fxXML.dz !== undefined)
                                    fx.dz = parseInt(fxXML.dz.toString());
                                if (fxXML.dd !== undefined)
                                    fx.dd = parseInt(fxXML.dd.toString());

                                if (fxXML.frame !== undefined)
                                    fx.frame = parseInt(fxXML.frame.toString());
                                fx.id = fxXML.id;

                                fxs.push(fx);
                            }
                        }
                        if (frameXML.bodyParts.length > 0) {
                            for (const bodypartXML of frameXML.bodyParts) {
                                const items: Array<Item> = new Array<Item>();
                                const bodypart: Bodypart = {} as any;
                                if (bodypartXML.items.length > 0) {
                                    for (const itemXML of bodypartXML.items) {
                                        const item: Item = {} as any;
                                        item.id = itemXML.id;
                                        item.base = itemXML.base;

                                        items.push(item);
                                    }
                                }
                                bodypart.action = bodypartXML.action;

                                if (bodypartXML.dx !== undefined)
                                    bodypart.dx = parseInt(bodypartXML.dx.toString());
                                if (bodypartXML.dy !== undefined)
                                    bodypart.dy = parseInt(bodypartXML.dy.toString());
                                if (bodypartXML.dz !== undefined)
                                    bodypart.dz = parseInt(bodypartXML.dz.toString());
                                if (bodypartXML.dd !== undefined)
                                    bodypart.dd = parseInt(bodypartXML.dd.toString());

                                if (bodypartXML.frame !== undefined)
                                    bodypart.frame = parseInt(bodypartXML.frame.toString());
                                bodypart.id = bodypartXML.id;
                                bodypart.base = bodypartXML.base;
                                bodypart.items = items;

                                bodyparts.push(bodypart);
                            }
                        }
                        frame.fxs = fxs;
                        frame.bodyparts = bodyparts;
                        overrideFrames.push(frame);
                    }
                    override.frames = overrideFrames;
                    overrides.push(override);
                }
            }
        }
        animation.frames = frames;
        animation.shadows = shadows;
        animation.adds = adds;
        animation.directions = directions;
        animation.avatars = avatars;
        animation.removes = removes;
        animation.sprites = sprites;
        animation.overrides = overrides;
        animations[output.name] = animation;

        output.animations = animations;
    }
}