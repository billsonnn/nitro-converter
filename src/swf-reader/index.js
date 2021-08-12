/**
 * Simple module for reading SWF properties
 *
 * (c) 2014 Rafael Leal Dias <rafaeldias.c at gmail dot com>
 * MIT LICENCE
 *
 */
const fs = require('fs');
const zlib = require('zlib');
const lzma = require('lzma-purejs');
const Stream = require('stream');
const SWFTags = require('./lib/swf-tags');
const SWFReader = exports;
import { SWFBuffer } from './lib/SWFBuffer';

function readSWFTags(buff, swf)
{
    var tags = []
        , tag
        , tagHeader
        , flag
        , l
        , sc
        , fc;

    /* Reads TagCodeAndLength from Tag's RECORDHEADER */
    while( (tagHeader = buff.readTagCodeAndLength()) )
    {
        tag = {
            header : tagHeader
        };
        switch( tagHeader.code )
        {
            case SWFTags.FileAttributes: {
                const flag =  buff.readUIntLE(32);
                const fileAttrs = {};

                fileAttrs.useNetwork    = tag.useNetwork    = !!(flag & 0x1);
                fileAttrs.as3           = tag.as3           = !!(flag & 0x8);
                fileAttrs.hasMetaData   = tag.hasMetaData   = !!(flag & 0x10);
                fileAttrs.useGPU        = tag.useGPU        = !!(flag & 0x20);
                fileAttrs.useDirectBit  = tag.useDirectBlit = !!(flag & 0x40);

                swf.fileAttributes = fileAttrs;
                break;
            }
            case SWFTags.Metadata: {
                swf.metadata = tag.metadata = buff.readString();
                break;
            }
            case SWFTags.SetBackgroundColor: {
                tag.RGB = buff.readRGB();
                swf.backgroundColor = '#' + (tag.RGB[0]*65536 + tag.RGB[1]*256 + tag.RGB[0]).toString(16);
                break;
            }
            case SWFTags.Protect :
                swf.protect = tagHeader.length && buff.readString();
                break;
            case SWFTags.DefineSceneAndFrameLabelData :
                sc = tag.sceneCount = buff.readEncodedU32();
                tag.scenes = [];

                while(sc--)
                    tag.scenes.push({
                        offset  : buff.readEncodedU32(),
                        name    : buff.readString()
                    });

                fc = tag.frameLabelCount = buff.readEncodedU32();
                tag.labels = [];

                while(fc--)
                    tag.labels.push({
                        frameNum    : buff.readEncodedU32(),
                        frameLabel  : buff.readString()
                    });
                break;
                /**
       * DefineShape4 extends the capabilities of
       * DefineShape3 by using a new line style
       * record in the shape
       */
                //case SWFTags.DefineShape4 :
                //  /* id for this character */
                //  tag.ShapeId = buff.readUIntLE(16);
                //  /* bounds of the shape */
                //  tag.ShapeBounds = buff.readRect();
                //  /* bounds of the shape, excluding the strokes */
                //  tag.EdgeBounds = buff.readRect();
                //  /* reserved, must be 0 */
                //  if (0 !== buff.readBits(5))
                //    throw new Error('Reserved bit used.');
                //  /* if 1, use fill winding. >= SWF 10 */
                //  if (swf.version >= 10)
                //    tag.UsesFillWindingRule = buff.readBits(1);
                //  /**
                //   * if 1, shape contains at least one
                //   * non-scaling stroke.
                //   */
                //  tag.UsesNonScallingStrokes = buff.readBits(1);
                //  /**
                //   * if 1, shape contains at least one
                //   * scaling stroke
                //   */
                //  tag.UsesScalingStrokes = buff.readBits(1);
                //  tag.shapes = buff.readShapeWithStyle();
                //  break;
            case SWFTags.FrameLabel :
                tag.name = buff.readString();
                l = Buffer.byteLength(tag.name);
                /* check if it's an named anchor */
                if(l & (tagHeader.length - 1) != l)
                    tag.anchor = buff.readUInt8();
                break;
            case SWFTags.DefineSprite :
                tag.SpriteID = buff.readUIntLE(16);
                tag.FrameCount = buff.readUIntLE(16);
                tag.ControlTags = readSWFTags(buff, swf);
                break;
            case SWFTags.ExportAssets :
                tag.count = buff.readUIntLE(16);
                tag.assets = [];

                l = 0;

                while(l++ < tag.count)
                    tag.assets.push({
                        id : buff.readUIntLE(16),
                        name : buff.readString()
                    });
                break;
            case SWFTags.ImportAssets :
                /**
         * URL where the source SWF file can be found
         */
                tag.url = buff.readString();
                /**
         * Number of assets to import
         */
                tag.count = buff.readUIntLE(16);
                tag.assets = [];

                l = 0;

                while(l++ < tag.count)
                    tag.assets.push({
                        /**
             * Character ID for the l-th item
             * in importing SWF file
             */
                        id : buff.readUIntLE(16),
                        /**
             * Identifies for the l-th
             * imported character
             */
                        name : buff.readString()
                    });
                break;
            case SWFTags.ImportAssets2 :
                tag.url = buff.readString();

                if( !(1 === buff.readUInt8() && 0 === buff.readUInt8()) )
                {
                    throw new Error('Reserved bits for ImportAssets2 used');
                }

                tag.count = buff.readUIntLE(16);
                tag.assets = [];

                l = 0;

                while(l++ < tag.count)
                    tag.assets({
                        id : buff.readUIntLE(16),
                        name : buff.readString()
                    });
                break;
            case SWFTags.EnableDebbuger :
                tag.password = buff.readString();
                break;
            case SWFTags.EnableDebugger2 :
                if(0 !== buff.readUIntLE(16))
                {
                    //throw new Error('Reserved bit for EnableDebugger2 used.');
                }
                tag.password = buff.readString();
                break;
            case SWFTags.ScriptLimits :
                /**
         * Maximum recursion Depth
         */
                tag.maxRecursionDepth = buff.readUIntLE(16);
                /**
         * Maximum ActionScript processing time before script
         * stuck dialog box displays
         */
                tag.scriptTimeoutSeconds = buff.readUIntLE(16);
                break;
            case SWFTags.SymbolClass: {
                tag.numSymbols = buff.readUIntLE(16);
                tag.symbols = [];

                l = 0;

                while(l++ < tag.numSymbols)
                    tag.symbols.push({
                        id : buff.readUIntLE(16),
                        name : buff.readString()
                    });
                break;
            }
            case SWFTags.DefineScalingGrid: {
                tag.characterId = buff.readUIntLE(16);
                tag.splitter = buff.readRect();
                break;
            }
            case SWFTags.setTabIndex: {
                tag.depth = buff.readUIntLE(16);
                tag.tabIndex = buff.readUIntLE(16);
                break;
            }
            case SWFTags.JPEGTables: {
                tag.jpegData = buff.buffer.slice(buff.pointer, buff.pointer + tagHeader.length);
                buff.pointer += tagHeader.length;
                break;
            }
            case SWFTags.DefineBits: {
                tag.characterId = buff.readUIntLE(16);
                tag.jpegData = buff.buffer.slice(buff.pointer, buff.pointer + tagHeader.length - 2);
                buff.pointer += tagHeader.length - 2;
                break;
            }
            case SWFTags.DefineBitsJPEG2: {
                tag.characterId = buff.readUIntLE(16);
                tag.imageData = buff.buffer.slice(buff.pointer, buff.pointer + tagHeader.length - 2);
                buff.pointer += tagHeader.length - 2;
                break;
            }
            case SWFTags.DefineBitsJPEG3: {
                tag.characterId = buff.readUIntLE(16);
                var alphaDataOffset = buff.readUIntLE(32);
                tag.imageData = buff.buffer.slice(buff.pointer, buff.pointer + alphaDataOffset);
                buff.pointer += alphaDataOffset;
                var restLength = tagHeader.length - 6 - alphaDataOffset;
                tag.bitmapAlphaData = buff.buffer.slice(buff.pointer, buff.pointer + restLength);
                buff.pointer += restLength;
                break;
            }
            case SWFTags.DefineBitsJPEG4: {
                tag.characterId = buff.readUIntLE(16);
                const alphaDataOffset = buff.readUIntLE(32);
                tag.deblockParam = buff.readUIntLE(16);
                tag.imageData = buff.buffer.slice(buff.pointer, buff.pointer + alphaDataOffset);
                buff.pointer += alphaDataOffset;
                const restLength = tagHeader.length - 8 - alphaDataOffset;
                tag.bitmapAlphaData = buff.buffer.slice(buff.pointer, buff.pointer + restLength);
                buff.pointer += restLength;
                break;
            }
            case SWFTags.DefineBitsLossless:
            case SWFTags.DefineBitsLossless2: {
                tag.characterId = buff.readUIntLE(16);
                tag.bitmapFormat = buff.readUInt8();
                tag.bitmapWidth = buff.readUIntLE(16);
                tag.bitmapHeight = buff.readUIntLE(16);
                let restLength = tagHeader.length - 7;
                if(tag.bitmapFormat == 3)
                {
                    tag.bitmapColorTableSize = buff.readUInt8();
                    restLength--;
                }
                tag.zlibBitmapData = buff.buffer.slice(buff.pointer, buff.pointer + restLength);
                buff.pointer += restLength;
                break;
            }
            default:
                tag.data = buff.buffer.slice(buff.pointer, buff.pointer + tagHeader.length);
                buff.pointer += tagHeader.length;
                break;
        }
        tags.push(tag);
    }
    return tags;
}

/**
 * Reads tags and their contents, passaing a SWF object to callback
 *
 * @param {SWFBuffer} buff
 * @param {Buffer} compressed_buff
 * @param {function} callback
 * @api private
 *
 */
function readSWFBuff(buff, compressed_buff, next)
{
    buff.seek(3);// start

    if(buff.length < 9)
    {
        if(isSync) throw new Error('Buffer is to small, must be greater than 9 bytes.');
        return next(new Error('Buffer is to small, must be greater than 9 bytes.'));
    }
    var swf = {
            version     : buff.readUInt8(),
            fileLength  : {
                compressed    : compressed_buff.length,
                uncompressed  : buff.readUIntLE(32)
            },
            frameSize   : buff.readRect(), // Returns a RECT object. i.e : { x : 0, y : 0, width : 200, height: 300 }
            frameRate   : buff.readUIntLE(16)/256,
            frameCount  : buff.readUIntLE(16)
        }
        , isSync = 'function' !== typeof next;

    try
    {
        swf.tags = readSWFTags(buff, swf);
    }
    catch (e)
    {
        if(isSync) throw e;
        return next(e);
    }

    return isSync && swf || next( null, swf );
}

/**
 * Concat SWF Header with uncompressed Buffer
 *
 * @param {Buffer|ArrayBuffer} buff
 * @param {Buffer|ArrayBuffer} swf
 */
function concatSWFHeader(buff, swf)
{
    return Buffer.concat([swf.slice(0, 8), buff]);
}

/**
 * Uncompress SWF and start reading it
 *
 * @param {Buffer|ArrayBuffer} swf
 * @param {function} callback
 *
 */
function uncompress(swf, next)
{
    var compressed_buff = swf.slice(8)
        , uncompressed_buff
        , isSync = 'function' !== typeof next
        , e;

    // uncompress buffer
    switch(swf[0])
    {
        case 0x43 : // zlib compressed
            if(isSync)
            {
                uncompressed_buff = concatSWFHeader(zlib.unzipSync(compressed_buff), swf);

                if(!Buffer.isBuffer(uncompressed_buff))
                {
                    console.log('invalid_buffer');

                    return null;
                }
                return readSWFBuff(new SWFBuffer(uncompressed_buff), swf);
            }

            if(!Buffer.isBuffer(compressed_buff))
            {
                console.log('invalid_buffer');

                return null;
            }

            zlib.inflate(compressed_buff, function(err, buf)
            {
                readSWFBuff(new SWFBuffer(buf), swf, next);
            });
            break;
        case 0x46 : // uncompressed
            return readSWFBuff(new SWFBuffer( swf ), swf, next);
        case 0x5a : // LZMA compressed
            var lzmaProperties = compressed_buff.slice(4, 9);
            compressed_buff = compressed_buff.slice(9);

            var input_stream = new Stream();
            input_stream.pos = 0;
            input_stream.readByte = function()
            {
                return this.pos >= compressed_buff.length ? -1 : compressed_buff[this.pos++];
            };

            var output_stream = new Stream();
            output_stream.buffer = new Buffer(16384);
            output_stream.pos = 0;
            output_stream.writeByte = function(_byte)
            {
                if(this.pos >= this.buffer.length)
                {
                    var newBuffer = new Buffer(this.buffer.length * 2);
                    this.buffer.copy(newBuffer);
                    this.buffer = newBuffer;
                }
                this.buffer[this.pos++] = _byte;
            };
            output_stream.getBuffer = function()
            {
                // trim buffer
                if(this.pos !== this.buffer.length)
                {
                    var newBuffer = new Buffer(this.pos);
                    this.buffer.copy(newBuffer, 0, 0, this.pos);
                    this.buffer = newBuffer;
                }
                return this.buffer;
            };

            lzma.decompress(lzmaProperties, input_stream, output_stream, -1);
            uncompressed_buff = Buffer.concat([swf.slice(0, 8), output_stream.getBuffer()]);

            return readSWFBuff(new SWFBuffer(uncompressed_buff), swf, next);
        default :
            e = new Error('Unknown SWF compressions');

            if(isSync)
            {
                throw e;
            }
            else
            {
                next(e);
            }
    }
}

/**
 * Check if file is Buffer or ArrayBuffer
 *
 * @param {Buffer|ArrayBuffer) b
 * @api private
 *
 */
function isBuffer(b)
{
    return typeof Buffer !== 'undefined' && Buffer.isBuffer(b) || b instanceof ArrayBuffer;
}

/* Exposes Tags constants */
SWFReader.TAGS = SWFTags;

/**
 * Reads SWF file
 *
 * @param {String|Buffer}} file
 * @param {function} next - if not a function, uses synchronous algorithm
 * @api public
 *
 */
SWFReader.read = SWFReader.readSync = function(file, next)
{
    if(isBuffer(file))
    {
    /* File is already a buffer */
        return uncompress(file, next);
    }
    else
    {
    /* Get the buffer */
        if('function' === typeof next)
        {
            fs.readFile(file, function(err, swf)
            {
                if( err )
                {
                    next(err);
                    return;
                }
                uncompress(swf, next);
            });
        }
        else
        {
            return uncompress(fs.readFileSync(file));
        }
    }
};
