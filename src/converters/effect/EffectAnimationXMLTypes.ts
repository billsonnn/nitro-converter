export class AnimationXML {
    private readonly _name: string;
    private readonly _desc: string;
    private readonly _resetOnToggle: boolean | undefined;

    private readonly _directions: Array<DirectionOffsetXML>;
    private readonly _shadows: Array<ShadowXML>;
    private readonly _adds: Array<AddXML>;
    private readonly _removes: Array<RemoveXML>;
    private readonly _sprites: Array<SpriteXML>;
    private readonly _frames: Array<FrameXML>;
    private readonly _avatars: Array<AvatarXML>;
    private readonly _overrides: Array<OverrideXML>;

    constructor(animationXML: any) {
        const animation = animationXML.animation;
        const attributes = animation.$;

        this._name = attributes.name;
        this._desc = attributes.desc;

        if (attributes.resetOnToggle !== undefined) this._resetOnToggle = attributes.resetOnToggle === '1';

        this._directions = new Array<DirectionOffsetXML>();
        if (animation.direction !== undefined) {
            for (const direction of animation.direction) {
                this._directions.push(new DirectionOffsetXML(direction));
            }
        }

        this._shadows = new Array<ShadowXML>();
        if (animation.shadow !== undefined) {
            for (const shadow of animation.shadow) {
                this._shadows.push(new ShadowXML(shadow));
            }
        }

        this._adds = new Array<AddXML>();
        if (animation.add !== undefined) {
            for (const add of animation.add) {
                this._adds.push(new AddXML(add));
            }
        }

        this._removes = new Array<RemoveXML>();
        if (animation.remove !== undefined) {
            for (const remove of animation.remove) {
                this._removes.push(new RemoveXML(remove));
            }
        }

        this._sprites = new Array<SpriteXML>();
        if (animation.sprite !== undefined) {
            for (const sprite of animation.sprite) {
                this._sprites.push(new SpriteXML(sprite));
            }
        }

        this._frames = new Array<FrameXML>();
        if (animation.frame !== undefined) {
            for (const frame of animation.frame) {
                this._frames.push(new FrameXML(frame));
            }
        }

        this._avatars = new Array<AvatarXML>();
        if (animation.avatar !== undefined) {
            for (const avatar of animation.avatar) {
                this._avatars.push(new AvatarXML(avatar));
            }
        }

        this._overrides = new Array<OverrideXML>();
        if (animation.override !== undefined) {
            for (const override of animation.override) {
                this._overrides.push(new OverrideXML(override));
            }
        }
    }

    get name(): string {
        return this._name;
    }

    get desc(): string {
        return this._desc;
    }

    get resetOnToggle(): boolean | undefined {
        return this._resetOnToggle;
    }

    get directions(): Array<DirectionOffsetXML> {
        return this._directions;
    }

    get shadows(): Array<ShadowXML> {
        return this._shadows;
    }

    get adds(): Array<AddXML> {
        return this._adds;
    }

    get removes(): Array<RemoveXML> {
        return this._removes;
    }

    get sprites(): Array<SpriteXML> {
        return this._sprites;
    }

    get frames(): Array<FrameXML> {
        return this._frames;
    }

    get avatars(): Array<AvatarXML> {
        return this._avatars;
    }

    get overrides(): Array<OverrideXML> {
        return this._overrides;
    }
}

export class OverrideXML {
    private readonly _name: string;
    private readonly _override: string;

    private readonly _frames: Array<FrameXML>;

    constructor(overrideXML: any) {
        const attributes = overrideXML.$;

        this._name = attributes.name;
        this._override = attributes.override;

        this._frames = new Array<FrameXML>();
        if (overrideXML.frame !== undefined) {
            for (const frame of overrideXML.frame) {
                this._frames.push(new FrameXML(frame));
            }
        }
    }

    get name(): string {
        return this._name;
    }

    get override(): string {
        return this._override;
    }

    get frames(): Array<FrameXML> {
        return this._frames;
    }
}

export class AvatarXML {
    private readonly _ink: number;
    private readonly _foreground: string;
    private readonly _background: string;
    
    constructor(avatarXML: any) {
        const attributes = avatarXML.$;

        this._ink = attributes.ink;
        this._foreground = attributes.foreground;
        this._background = attributes.background;
    }

    get ink(): number {
        return this._ink;
    }

    get foreground(): string {
        return this._foreground;
    }

    get background(): string {
        return this._background;
    }
}

export class SpriteXML {
    private readonly _id: string;
    private readonly _member: string;
    private readonly _directions: number;
    private readonly _staticY: number;
    private readonly _ink: number;

    private readonly _directionList: Array<DirectionXML>;

    constructor(spriteXML: any) {
        const attributes = spriteXML.$;

        this._id = attributes.id;
        this._member = attributes.member;
        this._directions = attributes.directions;
        this._staticY = attributes.staticY;
        this._ink = attributes.ink;

        this._directionList = new Array<DirectionXML>();
        if (spriteXML.direction !== undefined) {
            for (const direction of spriteXML.direction) {
                this._directionList.push(new DirectionXML(direction));
            }
        }
    }

    get id(): string {
        return this._id;
    }

    get member(): string {
        return this._member;
    }

    get directions(): number {
        return this._directions;
    }

    get staticY(): number {
        return this._staticY;
    }

    get ink(): number {
        return this._ink;
    }

    get directionList(): Array<DirectionXML> {
        return this._directionList;
    }
}

export class DirectionXML {
    private readonly _id: number;
    private readonly _dx: number;
    private readonly _dy: number;
    private readonly _dz: number;
    
    constructor(directionXML: any) {
        const attributes = directionXML.$;

        this._id = attributes.id;
        this._dx = attributes.dx;
        this._dy = attributes.dy;
        this._dz = attributes.dz;
    }

    get id(): number {
        return this._id;
    }

    get dx(): number {
        return this._dx;
    }

    get dy(): number {
        return this._dy;
    }

    get dz(): number {
        return this._dz;
    }
}

export class RemoveXML {
    private readonly _id: string;

    constructor(removeXML: any) {
        this._id = removeXML.$.id;
    }

    get id(): string {
        return this._id;
    }
}

export class AddXML {
    private readonly _id: string;
    private readonly _align: string;
    private readonly _blend: string;
    private readonly _ink: number;
    private readonly _base: string;

    constructor(addXML: any) {
        const attributes = addXML.$;

        this._id = attributes.id;
        this._align = attributes.align;
        this._blend = attributes.blend;
        this._ink = attributes.ink;
        this._base = attributes.base;
    }

    get id(): string {
        return this._id;
    }

    get align(): string {
        return this._align;
    }

    get blend(): string {
        return this._blend;
    }

    get ink(): number {
        return this._ink;
    }

    get base(): string {
        return this._base;
    }
}

export class FrameXML {
    private readonly _repeats: number | undefined;
    private readonly _fxs: Array<FxXML>;
    private readonly _bodyParts: Array<BodyPartXML>;

    constructor(frameXML: any) {
        if (frameXML.$ !== undefined)
            this._repeats = frameXML.$.repeats;

        this._fxs = new Array<FxXML>();
        if (frameXML.fx !== undefined) {
            for (const fx of frameXML.fx) {
                this._fxs.push(new FxXML(fx));
            }
        }

        this._bodyParts = new Array<BodyPartXML>();
        if (frameXML.bodypart !== undefined) {
            for (const bodypart of frameXML.bodypart) {
                this._bodyParts.push(new BodyPartXML(bodypart));
            }
        }
    }

    get repeats(): number | undefined {
        return this._repeats;
    }

    get fxs(): Array<FxXML> {
        return this._fxs;
    }

    get bodyParts(): Array<BodyPartXML> {
        return this._bodyParts;
    }
}

export class BodyPartXML {
    private readonly _id: string;
    private readonly _frame: number;
    private readonly _dx: number;
    private readonly _dy: number;
    private readonly _dz: number;
    private readonly _dd: number;
    private readonly _action: string;
    private readonly _base: string;

    private readonly _items: Array<ItemXML>;

    constructor(bodyPartXML: any) {
        const attributes = bodyPartXML.$;

        this._id = attributes.id;
        this._frame = attributes.frame;
        this._dx = attributes.dx;
        this._dy = attributes.dy;
        this._dz = attributes.dz;
        this._dd = attributes.dd;
        this._action = attributes.action;
        this._base = attributes.base;

        this._items = new Array<ItemXML>();
        if (bodyPartXML.item !== undefined) {
            for (const item of bodyPartXML.item) {
                this._items.push(new ItemXML(item));
            }
        }
    }

    get id(): string {
        return this._id;
    }

    get frame(): number {
        return this._frame;
    }

    get dx(): number {
        return this._dx;
    }

    get dy(): number {
        return this._dy;
    }

    get dz(): number {
        return this._dz;
    }

    get dd(): number {
        return this._dd;
    }

    get action(): string {
        return this._action;
    }

    get base(): string {
        return this._base;
    }

    get items(): Array<ItemXML> {
        return this._items;
    }
}

export class ItemXML {
    private readonly _id: string;
    private readonly _base: string;

    constructor(itemXML: any) {
        const attributes = itemXML.$;

        this._id = attributes.id;
        this._base = attributes.base;
    }

    get id(): string {
        return this._id;
    }

    get base(): string {
        return this._base;
    }
}

export class FxXML {
    private readonly _id: string;
    private readonly _repeats: number;
    private readonly _frame: number;
    private readonly _dx: number;
    private readonly _dy: number;
    private readonly _dz: number;
    private readonly _dd: number;
    private readonly _action: string;

    constructor(fxXML: any) {
        const attributes = fxXML.$;

        this._id = attributes.id;
        this._repeats = attributes.repeats;
        this._frame = attributes.frame;
        this._dx = attributes.dx;
        this._dy = attributes.dy;
        this._dz = attributes.dz;
        this._dd = attributes.dd;
        this._action = attributes.action;
    }

    get id(): string {
        return this._id;
    }

    get repeats(): number {
        return this._repeats;
    }

    get frame(): number {
        return this._frame;
    }

    get dx(): number {
        return this._dx;
    }

    get dy(): number {
        return this._dy;
    }

    get dz(): number {
        return this._dz;
    }

    get dd(): number {
        return this._dd;
    }

    get action(): string {
        return this._action;
    }
}

export class ShadowXML {
    private readonly _id: string;

    constructor(shadowXML: any) {
        this._id = shadowXML.$.id;
    }

    get id(): string {
        return this._id;
    }
}

export class DirectionOffsetXML {
    private readonly _offset: number;

    constructor(directionXML: any) {
        this._offset = directionXML.$.offset;
    }

    get offset(): number {
        return this._offset;
    }
}