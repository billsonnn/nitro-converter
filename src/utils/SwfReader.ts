const SWFReader = require('@gizeta/swf-reader');
const {extractImage, test} = require("swf-extract");

var _encoder = require('png-stream/encoder');

var _encoder2 = _interopRequireDefault(_encoder);

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _streamToArray = require('stream-to-array');

var _streamToArray2 = _interopRequireDefault(_streamToArray);

function _interopRequireDefault(obj: any) { return obj && obj.__esModule ? obj : { default: obj }; }

export function readSwfAsync(path: string): Promise<any> {
    return new Promise<any>(((resolve, reject) => {
        SWFReader.read(path, function (err: Error, swf: any) {
            if (err) {
                reject(err);
            }
            resolve(swf);
        });
    }));
}


export async function readImagesJPEG(code: number, tag: any) {
    return test(code)(tag);
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
            var output = new Buffer(bitmapWidth * bitmapHeight * 4);
            var index = 0;
            var ptr = 0;
            if (bitmapFormat === 5) {
                // 32-bit ARGB image
                for (var y = 0; y < bitmapHeight; ++y) {
                    for (var x = 0; x < bitmapWidth; ++x) {
                        var alpha = dataBuf[ptr];
                        output[index] = dataBuf[ptr + 1];
                        output[index + 1] = dataBuf[ptr + 2];
                        output[index + 2] = dataBuf[ptr + 3];
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
                imgData: Buffer.concat(buffers)
            });
        });
    }).catch(function (e) {
        console.error(e);
    });
}