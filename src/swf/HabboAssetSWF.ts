import CustomIterator from '../utils/CustomIterator';
import {readImagesDefineBitsLossless, readImagesJPEG3or4, readSwfAsync} from '../utils/SwfReader';
import {CharacterTag} from './tags/CharacterTag';
import {DefineBinaryDataTag} from './tags/DefineBinaryDataTag';
import {ImageTag} from './tags/ImageTag';
import {ITag} from './tags/ITag';
import {SymbolClassTag} from './tags/SymbolClassTag';
import {writeFileSync} from "fs";

export class HabboAssetSWF {
    private readonly _tags: Array<ITag>;
    private _documentClass: string | null = null;

    constructor(
        private readonly _data: string | Buffer
    ) {
        this._tags = new Array<ITag>();
    }

    async setupAsync() {
        const swf = await readSwfAsync(this._data);
        for (const tag of swf.tags) {

            switch (tag.header.code) {
                case 76:
                    this._tags.push(new SymbolClassTag(tag.symbols));
                    break;
                case 87:
                    this._tags.push(new DefineBinaryDataTag(tag.data));
                    break;

                case 6:
                    console.log(tag);
                    break;

                case 21: {
                    const jpeg3 = await readImagesJPEG3or4(21, tag);
                    this._tags.push(new ImageTag({
                        code: 21,
                        characterID: jpeg3.characterId,
                        imgType: 'jpeg',
                        imgData: jpeg3.imageData,
                        bitmapWidth: jpeg3.bitmapWidth,
                        bitmapHeight: jpeg3.bitmapHeight
                    }));
                    break;
                }

                case 35: {
                    const jpeg3 = await readImagesJPEG3or4(35, tag);
                    this._tags.push(new ImageTag({
                        code: jpeg3.code,
                        characterID: jpeg3.characterId,
                        imgType: jpeg3.imgType,
                        imgData: jpeg3.imgData,
                        bitmapWidth: jpeg3.bitmapWidth,
                        bitmapHeight: jpeg3.bitmapHeight
                    }));
                    break;
                }

                case 36: {
                    const pngTagLossLess2: any = await readImagesDefineBitsLossless(tag);
                    this._tags.push(new ImageTag({
                        code: pngTagLossLess2.code,
                        characterID: pngTagLossLess2.characterId,
                        imgType: pngTagLossLess2.imgType,
                        imgData: pngTagLossLess2.imgData,
                        bitmapWidth: pngTagLossLess2.bitmapWidth,
                        bitmapHeight: pngTagLossLess2.bitmapHeight
                    }));
                    break;
                }

                case 20: {
                    const pngTagLossless: any = await readImagesDefineBitsLossless(tag);
                    this._tags.push(new ImageTag({
                        code: pngTagLossless.code,
                        characterID: pngTagLossless.characterId,
                        imgType: pngTagLossless.imgType,
                        imgData: pngTagLossless.imgData,
                        bitmapWidth: pngTagLossless.bitmapWidth,
                        bitmapHeight: pngTagLossless.bitmapHeight
                    }));
                    break;
                }

                case 90:
                    console.log(tag);
                    break;

                default:
                    //console.log(tag.header.code);
                    break;
            }
        }

        this.assignClassesToSymbols();
    }

    public imageTags(): Array<ImageTag> {
        return this._tags.filter((tag: ITag) => tag instanceof ImageTag).map(x => x as ImageTag);
    }

    public symbolTags(): Array<SymbolClassTag> {
        return this._tags.filter((tag: ITag) => tag instanceof SymbolClassTag).map(x => x as SymbolClassTag);
    }

    private binaryTags(): Array<DefineBinaryDataTag> {
        return this._tags.filter((tag: ITag) => tag instanceof DefineBinaryDataTag).map(x => x as DefineBinaryDataTag);
    }

    private assignClassesToSymbols() {
        const classes: Map<number, string> = new Map();

        let iterator: CustomIterator<ITag> = new CustomIterator(this._tags);

        // eslint-disable-next-line no-constant-condition
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

    public getBinaryTagByName(name: string): DefineBinaryDataTag | null {
        const streamTag = this.binaryTags()
            .filter(tag => tag.className === name)[0];

        if (streamTag === undefined) return null;

        return streamTag;
    }

    public getFullClassName(type: string, documentNameTwice: boolean): string {
        return this.getFullClassNameSnake(type, documentNameTwice, false);
    }

    public getFullClassNameSnake(type: string, documentNameTwice: boolean, snakeCase: boolean): string {
        let result: string = this.getDocumentClass() + '_';
        if (documentNameTwice) {
            if (snakeCase) {
                //result += CaseFormat.UPPER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, this.swf.getDocumentClass()) + "_";
            } else {
                result += this.getDocumentClass() + '_';
            }
        }

        return result + type;
    }

    public getDocumentClass(): string {
        if (this._documentClass !== null) return this._documentClass;

        const iterator: CustomIterator<ITag> = new CustomIterator(this._tags);

        // eslint-disable-next-line no-constant-condition
        while (true) {
            let t: ITag;
            do {
                if (!iterator.hasNext()) {
                    return '';
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
}
