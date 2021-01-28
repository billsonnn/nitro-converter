import SymbolClassTag from "./tags/SymbolClassTag";
import ImageTag from "./tags/ImageTag";
import ITag from "./tags/ITag";
import CustomIterator from "../utils/CustomIterator";
import CharacterTag from "./tags/CharacterTag";
import DefineBinaryDataTag from "./tags/DefineBinaryDataTag";

const {readFromBufferP, extractImages} = require('swf-extract');

export interface Tag {
    code: number,
    length: number,
    rawData: Buffer
}

export interface SWFFrameSize {
    x: number,
    y: number,
    width: number,
    height: number
}

export interface SWFFileLength {
    compressed: number,
    uncompressed: number
}

export interface SWF {
    tags: Array<Tag>,
    version: number,
    fileLength: SWFFileLength,
    frameSize: SWFFrameSize,
    frameRate: number,
    frameCount: number
}

export default class HabboAssetSWF {

    private swf: SWF | null;

    private readonly _tags: Array<ITag>;

    private _documentClass: string | null = null;

    constructor(private readonly _buffer: Buffer) {
        this.swf = null;

        this._tags = new Array<ITag>();
    }

    public async setupAsync() {
        this.swf = await readFromBufferP(this._buffer);

        if (this.swf === null) throw new Error("SWF Can't be null!");

        for (const tag of this.swf.tags) {
            if (tag.code === 76) {
                this._tags.push(new SymbolClassTag(tag));
            }

            if (tag.code === 87) {
                this._tags.push(new DefineBinaryDataTag(tag));
            }
        }

        const images = await Promise.all(extractImages(this.swf.tags));
        for (const image of images) {
            const imgObj: any = image;
            this._tags.push(new ImageTag({
                code: imgObj.code,
                characterID: imgObj.characterId,
                imgType: imgObj.imgType,
                imgData: imgObj.imgData
            }));
        }

        this.assignClassesToSymbols();
    }

    public imageTags(): Array<ImageTag> {
        return this._tags.filter((tag: ITag) => tag instanceof ImageTag).map(x => x as ImageTag);
    }

    public symbolTags(): Array<SymbolClassTag> {
        return this._tags.filter((tag: ITag) => tag instanceof SymbolClassTag).map(x => x as SymbolClassTag)
    }

    private binaryTags(): Array<DefineBinaryDataTag> {
        return this._tags.filter((tag: ITag) => tag instanceof DefineBinaryDataTag).map(x => x as DefineBinaryDataTag);
    }

    public getBinaryTagByName(name: string): DefineBinaryDataTag | null {
        const streamTag = this.binaryTags()
            .filter(tag => tag.className === name)[0];

        if (streamTag === undefined) return null;

        return streamTag;
    }

    private assignClassesToSymbols() {
        const classes: Map<number, string> = new Map();

        let iterator: CustomIterator<ITag> = new CustomIterator(this._tags);

        while (true) {
            let t: ITag;
            do {
                if (!iterator.hasNext()) {
                    iterator = new CustomIterator(this._tags);

                    while (iterator.hasNext()) {
                        t = iterator.next();
                        if (t instanceof CharacterTag) {
                            const ct = t as CharacterTag;

                            if (classes.has(ct.characterId)) {
                                // @ts-ignore
                                ct.className = classes.get(ct.characterId);
                            }
                        }
                    }

                    return;
                }

                t = iterator.next();
            } while (!(t instanceof SymbolClassTag));

            const sct = t as SymbolClassTag;

            for (let i = 0; i < sct.tags.length; ++i) {
                if (!classes.has(sct.tags[i]) && !Array.from(classes.values()).includes(sct.names[i])) {
                    classes.set(sct.tags[i], sct.names[i]);
                }
            }
        }
    }

    public getFullClassName(type: string, documentNameTwice: boolean): string {
        return this.getFullClassNameSnake(type, documentNameTwice, false);
    }

    public getFullClassNameSnake(type: string, documentNameTwice: boolean, snakeCase: boolean): string {
        if (this.swf === null) throw new Error("SWF Can't be null!");

        let result: string = this.getDocumentClass() + "_";
        if (documentNameTwice) {
            if (snakeCase) {
                //result += CaseFormat.UPPER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, this.swf.getDocumentClass()) + "_";
            } else {
                result += this.getDocumentClass() + "_";
            }
        }

        return result + type;
    }

    public getDocumentClass(): string {
        if (this._documentClass !== null) return this._documentClass;

        let iterator: CustomIterator<ITag> = new CustomIterator(this._tags);

        while (true) {
            let t: ITag;
            do {
                if (!iterator.hasNext()) {
                    return "";
                }

                t = iterator.next();
            } while (!(t instanceof SymbolClassTag));

            const sc = t as SymbolClassTag;

            for (let i = 0; i < sc.tags.length; ++i) {
                if (sc.tags[i] == 0) {
                    this._documentClass = sc.names[i];
                    return this._documentClass;
                }
            }
        }
    }

    public setDocumentClass(documentClass: string) {
        this._documentClass = documentClass;
    }
}