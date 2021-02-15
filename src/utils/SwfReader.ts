const SWFReader = require('@gizeta/swf-reader');

const _encoder = require('png-stream/encoder');

const _encoder2 = _interopRequireDefault(_encoder);

const _zlib = require('zlib');

const _zlib2 = _interopRequireDefault(_zlib);

const _streamToArray = require('stream-to-array');

const _streamToArray2 = _interopRequireDefault(_streamToArray);

const _stream = require('stream');

const _stream2 = _interopRequireDefault(_stream);

const _decoder = require('jpg-stream/decoder');

const _decoder2 = _interopRequireDefault(_decoder);

function _interopRequireDefault(obj: any) {
    return obj && obj.__esModule ? obj : {default: obj};
}

const _concatFrames = require('concat-frames');

const _concatFrames2 = _interopRequireDefault(_concatFrames);

const _slicedToArray = function () {
    function sliceIterator(arr: any, i: any) {
        var _arr = [];
        var _n = true;
        var _d = false;
        var _e = undefined;
        try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
                _arr.push(_s.value);
                if (i && _arr.length === i) break;
            }
        } catch (err) {
            _d = true;
            _e = err;
        } finally {
            try {
                if (!_n && _i["return"]) _i["return"]();
            } finally {
                if (_d) throw _e;
            }
        }
        return _arr;
    }

    return function (arr: any, i: any) {
        if (Array.isArray(arr)) {
            return arr;
        } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
        } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
        }
    };
}();

export function readSwfAsync(data: string | Buffer): Promise<any> {
    return new Promise<any>(((resolve, reject) => {
        SWFReader.read(data, function (err: Error, swf: any) {
            if (err) {
                reject(err);
            }
            resolve(swf);
        });
    }));
}

const pngMagic = Buffer.from('0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A'.split(' ').map(Number));
const gifMagic = Buffer.from('0x47 0x49 0x46 0x38 0x39 0x61'.split(' ').map(Number));
const recognizeHeader = function recognizeHeader(buffer: Buffer) {
    if (pngMagic.equals(buffer.slice(0, pngMagic.length))) return 'png';
    if (gifMagic.equals(buffer.slice(0, gifMagic.length))) return 'gif';
    return 'jpeg';
};

export async function readImagesJPEG(code: number, tagData: any): Promise<any> {
    var characterId = tagData.characterId,
        imageData = tagData.imageData;

    var imgType = recognizeHeader(imageData);
    if (imgType !== 'jpeg') {
        return {
            code: code,
            characterId: characterId,
            imgType: imgType,
            imgData: imageData
        };
    }

    var bitmapAlphaData = tagData.bitmapAlphaData;

    return new Promise(function (resolve, reject) {
        var enc = new _encoder2.default(undefined, undefined, {colorSpace: 'rgba'});
        _zlib2.default.unzip(bitmapAlphaData, function (err: any, alphaBufPre: any) {
            // INVARIANT: alphaBuf is either null or a non-empty buffer
            let alphaBuf: any = null;
            if (err) {
                /*
                   Due to a bug present in node zlib (https://github.com/nodejs/node/issues/17041)
                   unzipping an empty buffer can raise "unexpected end of file" error.
                   We fix this here so that our impl does not depend on the version of node
                   being used.
                    Theoretically every zlib.unzip call needs to be guarded, but for this package,
                   other two zlib.unzip call happens at sites that an empty uncompressed Buffer
                   does not make sense. So I think the current fix is good enough.
                 */
                if (bitmapAlphaData.length > 0) {
                    return reject(new Error(err));
                }
                // leaving alphaBuf as null
            } else {
                // ensure alphaBuf is only assigned an non-empty Buffer
                if (alphaBufPre.length > 0) alphaBuf = alphaBufPre;
            }
            var bufferStream = new _stream2.default.PassThrough();
            bufferStream.end(imageData);
            bufferStream.pipe(new _decoder2.default()).pipe((_concatFrames2.default)(function (_ref: any) {
                var _ref2 = _slicedToArray(_ref, 1),
                    frame = _ref2[0];

                var input = frame.pixels;
                var pCount = frame.width * frame.height;
                var output = Buffer.alloc(pCount * 4);
                if (alphaBuf !== null && alphaBuf.length !== pCount) {
                    console.error('expect alphaBuf to have size ' + pCount + ' while getting ' + alphaBuf.length);
                }
                var getAlphaBuf = alphaBuf === null ? function (_ignored: any) {
                    return 0xff;
                } : function (i: any) {
                    return alphaBuf[i];
                };

                for (var i = 0; i < pCount; ++i) {
                    output[4 * i] = input[3 * i];
                    output[4 * i + 1] = input[3 * i + 1];
                    output[4 * i + 2] = input[3 * i + 2];
                    output[4 * i + 3] = getAlphaBuf(i);
                }
                enc.format.width = frame.width;
                enc.format.height = frame.height;
                enc.end(output);
            }));
        });
        (_streamToArray2.default)(enc).then(function (parts: any) {
            var buffers = parts.map(function (part: any) {
                return Buffer.isBuffer(part) ? part : Buffer.from(part);
            });
            resolve({
                code: code,
                characterId: characterId,
                imgType: 'png',
                imgData: Buffer.concat(buffers)
            });
        });
    });
}

export interface ImageTagData {
    code: number,
    characterId: number,
    imgType: string,
    imgData: Buffer,
    bitmapWidth: number,
    bitmapHeight: number
}

export function readImagesDefineBitsLossless(tag: any) {
    const characterId = tag.characterId,
        bitmapFormat = tag.bitmapFormat,
        bitmapWidth = tag.bitmapWidth,
        bitmapHeight = tag.bitmapHeight,
        bitmapColorTableSize = tag.bitmapColorTableSize,
        zlibBitmapData = tag.zlibBitmapData;


    return new Promise(function (resolve, reject) {
        const enc = new _encoder2.default(bitmapWidth, bitmapHeight, {colorSpace: 'rgba'});

        _zlib2.default.unzip(zlibBitmapData, function (err: any, dataBuf: any) {
            if (err) {
                return reject(new Error(err));
            }
            var output = Buffer.alloc(bitmapWidth * bitmapHeight * 4);
            var index = 0;
            var ptr = 0;
            if (bitmapFormat === 5) {
                // 32-bit ARGB image
                for (var y = 0; y < bitmapHeight; ++y) {
                    for (var x = 0; x < bitmapWidth; ++x) {
                        var alpha = dataBuf[ptr];
                        output[index] = dataBuf[ptr + 1] * (255 / alpha);
                        output[index + 1] = dataBuf[ptr + 2] * (255 / alpha);
                        output[index + 2] = dataBuf[ptr + 3] * (255 / alpha);
                        output[index + 3] = alpha;
                        index += 4;
                        ptr += 4;
                    }
                }
            } else if (bitmapFormat === 3) {
                // 8-bit colormapped image
                var colorMap = [];
                for (var i = 0; i < bitmapColorTableSize + 1; ++i) {
                    colorMap.push([dataBuf[ptr], dataBuf[ptr + 1], dataBuf[ptr + 2], dataBuf[ptr + 3]]);
                    ptr += 4;
                }
                for (var _y2 = 0; _y2 < bitmapHeight; ++_y2) {
                    for (var _x2 = 0; _x2 < bitmapWidth; ++_x2) {
                        var idx = dataBuf[ptr];
                        var color = idx < colorMap.length ? colorMap[idx] : [0, 0, 0, 0];
                        output[index] = color[0];
                        output[index + 1] = color[1];
                        output[index + 2] = color[2];
                        output[index + 3] = color[3];
                        ptr += 1;
                        index += 4;
                    }
                    // skip padding
                    ptr += (4 - bitmapWidth % 4) % 4;
                }
            } else {
                return reject(new Error('unhandled bitmapFormat: ' + bitmapFormat));
            }
            enc.end(output);
        });

        (_streamToArray2.default)(enc).then(function (parts: any) {
            var buffers = parts.map(function (part: any) {
                return Buffer.isBuffer(part) ? part : Buffer.from(part);
            });
            resolve({
                code: 36,
                characterId: characterId,
                imgType: 'png',
                imgData: Buffer.concat(buffers),
                bitmapWidth: bitmapWidth,
                bitmapHeight: bitmapHeight
            });
        });
    }).catch(function (e) {
        console.error(e);
    });
}