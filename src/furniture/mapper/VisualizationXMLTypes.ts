export class VisualizationDataXML {

    private readonly _type: string;
    private readonly _visualizations: Array<VisualizationXML>;

    constructor(visualizationXML: any) {
        this._type = visualizationXML.$.type;
        this._visualizations = new Array<VisualizationXML>();

        if (Array.isArray(visualizationXML.graphics)) {
            for (const graphic of visualizationXML.graphics) {
                for (const visualization of graphic.visualization) {
                    this._visualizations.push(new VisualizationXML(visualization));
                }
            }
        }
    }

    get type(): string {
        return this._type;
    }

    get visualizations(): Array<VisualizationXML> {
        return this._visualizations;
    }
}

export class VisualizationXML {

    private readonly _size: number;
    private readonly _layerCount: number;
    private readonly _angle: number;

    private readonly _layers: Array<LayerXML>;
    private readonly _directions: Array<DirectionXML>;
    private readonly _colors: Array<ColorXML>;
    private readonly _animations: Array<AnimationXML>;
    private readonly _postures: Array<PostureXML>;
    private readonly _gestures: Array<GestureXML>;

    constructor(visualizationXML: any) {
        const attributes = visualizationXML.$;
        this._size = attributes.size;
        this._layerCount = attributes.layerCount;
        this._angle = attributes.angle;

        this._layers = new Array<LayerXML>();
        if (visualizationXML.layers !== undefined)
            for (const layerParent of visualizationXML.layers) {
                if (Array.isArray(layerParent.layer)) {
                    for (const layer of layerParent.layer) {
                        this._layers.push(new LayerXML(layer));
                    }
                }
            }

        this._directions = new Array<DirectionXML>();
        if (visualizationXML.directions !== undefined) {
            for (const directionParent of visualizationXML.directions) {
                if (Array.isArray(directionParent.direction)) {
                    for (const direction of directionParent.direction) {
                        this._directions.push(new DirectionXML(direction));
                    }
                }
            }
        }

        this._colors = new Array<ColorXML>();
        if (visualizationXML.colors !== undefined) {
            for (const colorParent of visualizationXML.colors) {
                if (Array.isArray(colorParent.color)) {
                    for (const color of colorParent.color) {
                        this._colors.push(new ColorXML(color));
                    }
                }
            }
        }

        this._animations = new Array<AnimationXML>();
        if (visualizationXML.animations !== undefined) {
            for (const animationParent of visualizationXML.animations) {
                if (Array.isArray(animationParent.animation)) {
                    for (const animation of animationParent.animation) {
                        this._animations.push(new AnimationXML(animation));
                    }
                }
            }
        }

        this._postures = new Array<PostureXML>();
        if (visualizationXML.postures !== undefined) {
            for (const postureParent of visualizationXML.postures) {
                if (Array.isArray(postureParent.posture)) {
                    for (const posture of postureParent.posture) {
                        this._postures.push(new PostureXML(posture));
                    }
                }
            }
        }
        this._gestures = new Array<GestureXML>();
        if (visualizationXML.gestures !== undefined) {
            for (const gestureParent of visualizationXML.gestures) {
                if (Array.isArray(gestureParent.gesture)) {
                    for (const gesture of gestureParent.gesture) {
                        this._gestures.push(new GestureXML(gesture));
                    }
                }
            }
        }
    }

    get size(): number {
        return this._size;
    }

    get layerCount(): number {
        return this._layerCount;
    }

    get angle(): number {
        return this._angle;
    }

    get layers(): Array<LayerXML> {
        return this._layers;
    }

    get directions(): Array<DirectionXML> {
        return this._directions;
    }

    get colors(): Array<ColorXML> {
        return this._colors;
    }

    get animations(): Array<AnimationXML> {
        return this._animations;
    }

    get postures(): Array<PostureXML> {
        return this._postures;
    }

    get gestures(): Array<GestureXML> {
        return this._gestures;
    }
}

export class LayerXML {
    private readonly _id: number;
    private readonly _alpha: number;
    private readonly _x: number;
    private readonly _y: number;
    private readonly _z: number;
    private readonly _ink: string;
    private readonly _tag: string;
    private readonly _ignoreMouse: boolean | undefined;

    constructor(layerXML: any) {
        const attributes = layerXML.$;

        this._id = attributes.id;
        this._alpha = attributes.alpha;
        this._x = attributes.x;
        this._y = attributes.y;
        this._z = attributes.z;
        this._ink = attributes.ink;
        this._tag = attributes.tag;
        if (attributes.ignoreMouse !== undefined) {
            this._ignoreMouse = attributes.ignoreMouse === '1';
        }
    }

    get id(): number {
        return this._id;
    }

    get alpha(): number {
        return this._alpha;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get z(): number {
        return this._z;
    }

    get ink(): string {
        return this._ink;
    }

    get tag(): string {
        return this._tag;
    }

    get ignoreMouse(): boolean | undefined {
        return this._ignoreMouse;
    }
}

export class DirectionXML {
    private readonly _id: number;
    private readonly _layers: Array<LayerXML>;

    constructor(directionXML: any) {
        this._id = directionXML.$.id;

        this._layers = new Array<LayerXML>();
        if (directionXML.layer !== undefined) {
            for (const layer of directionXML.layer) {
                this._layers.push(new LayerXML(layer));
            }
        }
    }

    get id(): number {
        return this._id;
    }

    get layers(): Array<LayerXML> {
        return this._layers;
    }
}

export class ColorXML {
    private readonly _id: number;
    private readonly _layers: Array<ColorLayerXML>;

    constructor(colorXML: any) {
        this._id = colorXML.$.id;

        this._layers = new Array<ColorLayerXML>();
        for (const colorLayer of colorXML.colorLayer) {
            this._layers.push(new ColorLayerXML(colorLayer));
        }
    }


    get id(): number {
        return this._id;
    }

    get layers(): Array<ColorLayerXML> {
        return this._layers;
    }
}

export class ColorLayerXML {
    private readonly _id: number;
    private readonly _color: string;

    constructor(colorLayerXML: any) {
        const attributes = colorLayerXML.$;
        this._id = attributes.id;
        this._color = attributes.color;
    }

    get id(): number {
        return this._id;
    }

    get color(): string {
        return this._color;
    }
}

export class AnimationXML {
    private readonly _id: number;
    private readonly _transitionTo: number;
    private readonly _transitionFrom: number;
    private readonly _immediateChangeFrom: string;
    private readonly _layers: Array<AnimationLayerXML>;

    constructor(animationXML: any) {
        const attributes = animationXML.$;
        this._id = attributes.id;
        this._transitionTo = attributes.transitionTo;
        this._transitionFrom = attributes.transitionFrom;
        this._immediateChangeFrom = attributes.immediateChangeFrom;

        this._layers = new Array<AnimationLayerXML>();
        if (animationXML.animationLayer !== undefined) {
            for (const animationLayer of animationXML.animationLayer) {
                this._layers.push(new AnimationLayerXML(animationLayer))
            }
        }
    }

    get id(): number {
        return this._id;
    }

    get transitionTo(): number {
        return this._transitionTo;
    }

    get transitionFrom(): number {
        return this._transitionFrom;
    }

    get immediateChangeFrom(): string {
        return this._immediateChangeFrom;
    }

    get layers(): Array<AnimationLayerXML> {
        return this._layers;
    }
}

export class AnimationLayerXML {
    private readonly _id: number;
    private readonly _loopCount: number;
    private readonly _frameRepeat: number;
    private readonly _random: number;
    private readonly _randomStart: number;

    private readonly _frameSequences: Array<FrameSequenceXML>;

    constructor(animationLayerXML: any) {
        const attributes = animationLayerXML.$;
        this._id = attributes.id;
        this._loopCount = attributes.loopCount;
        this._frameRepeat = attributes.frameRepeat;
        this._random = attributes.random;
        this._randomStart = attributes.randomStart;

        this._frameSequences = new Array<FrameSequenceXML>();
        if (animationLayerXML.frameSequence !== undefined) {
            for (const frameSequence of animationLayerXML.frameSequence) {
                this._frameSequences.push(new FrameSequenceXML(frameSequence));
            }
        }
    }

    get id(): number {
        return this._id;
    }

    get loopCount(): number {
        return this._loopCount;
    }

    get frameRepeat(): number {
        return this._frameRepeat;
    }

    get random(): number {
        return this._random;
    }

    get randomStart(): number {
        return this._randomStart;
    }

    get frameSequences(): Array<FrameSequenceXML> {
        return this._frameSequences;
    }
}

export class FrameSequenceXML {
    private readonly _loopCount: number;
    private readonly _random: number;

    private readonly _frames: Array<FrameXML>;

    constructor(frameSequenceXML: any) {
        let attributes = frameSequenceXML.$;
        if (attributes === undefined) attributes = {};

        this._loopCount = attributes.loopCount;
        this._random = attributes.random;

        this._frames = new Array<FrameXML>();
        if (frameSequenceXML.frame !== undefined) {
            for (const frame of frameSequenceXML.frame) {
                this._frames.push(new FrameXML(frame));
            }
        }
    }

    get loopCount(): number {
        return this._loopCount;
    }

    get random(): number {
        return this._random;
    }

    get frames(): Array<FrameXML> {
        return this._frames;
    }
}

export class FrameXML {
    private readonly _id: string;
    private readonly _x: number;
    private readonly _y: number;
    private readonly _randomX: number;
    private readonly _randomY: number;

    private readonly _offsets: Array<OffsetXML>;

    constructor(frameXML: any) {
        const attributes = frameXML.$;

        this._id = attributes.id;
        this._x = attributes.x;
        this._y = attributes.y;
        this._randomX = attributes.randomX;
        this._randomY = attributes.randomY;

        this._offsets = new Array<OffsetXML>();
        if (frameXML.offsets !== undefined) {
            for (const offsetParent of frameXML.offsets) {
                for (const offset of offsetParent.offset) {
                    this._offsets.push(new OffsetXML(offset));
                }
            }
        }
    }

    get id(): string {
        return this._id;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get randomX(): number {
        return this._randomX;
    }

    get randomY(): number {
        return this._randomY;
    }

    get offsets(): Array<OffsetXML> {
        return this._offsets;
    }
}

export class OffsetXML {
    private readonly _direction: number;
    private readonly _x: number;
    private readonly _y: number;

    constructor(offsetXML: any) {
        const attributes = offsetXML.$;

        this._direction = attributes.direction;
        this._x = attributes.x;
        this._y = attributes.y;
    }

    get direction(): number {
        return this._direction;
    }

    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }
}

export class PostureXML {
    private readonly _id: string;
    private readonly _animationId: number;

    constructor(postureXML: any) {
        const attributes = postureXML.$;

        this._id = attributes.id;
        this._animationId = attributes.animationId;
    }

    get id(): string {
        return this._id;
    }

    get animationId(): number {
        return this._animationId;
    }
}

export class GestureXML {
    private readonly _id: string;
    private readonly _animationId: number;

    constructor(gestureXML: any) {
        const attributes = gestureXML.$;

        this._id = attributes.id;
        this._animationId = attributes.animationId;
    }

    get id(): string {
        return this._id;
    }

    get animationId(): number {
        return this._animationId;
    }
}