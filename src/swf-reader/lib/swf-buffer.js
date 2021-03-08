
var RECORDHEADER_LENTH_FULL = 0x3f
    // null-character
  , EOS = 0x00
  , styleCountExt = 0xFF;

function readStyleArray(buffer, next) {
  var styleArrayCount = buffer.readUInt8()
    , styles = [];

  if (styleArrayCount === styleCountExt)
    styleArrayCount = buffer.readUIntLE(16);

  for (var i = 0; i < styleArrayCount; i++)
    styles.push(next(buffer));

  return styles;
}

function readFillStyle(buffer) {
  var type = buffer.readUInt8()
    , fillStyle = {
        /**
         * 0x00 = solid
         * 0x10 = linear gradient fill
         * 0x12 = radial gradient fill
         * 0x13 = focal radial gradient fill (SWF 8 or later)
         * 0x40 = repeating bitmap fill
         * 0x41 = clipped bitmap fill
         * 0x42 = non-smoothed repeating bitmap
         * 0x43 = non-smoothed clipped bitmap
         */
        fillStyleType : type
      };
  
  switch (type) {
    case 0x00:
      fillStyle.color = buffer.readRGBA();
      break;
    case 0x10, 0x12, 0x13:
      console.log('Gradient');
      break;
    case 0x40, 0x41, 0x42, 0x43:
      fillStyle.bitmapId = buffer.readUIntLE(16);
      break;
  }

  return fillStyle; 
}

function readLineStyle(buffer) {
  return {
    width: buffer.readUIntLE(16)/20,
    color: buffer.readRGBA()
  };
}

function readShapeRecords(buffer) {
  var shapeRecords = []
    , typeFlag = buffer.readBits(1)
    , shapeRecord
    , eos;

  while ((eos = buffer.readBits(5))) {
    if (0 === typeFlag) {
      shaperecord = {
        type: 'STYLECHANGERECORD'
      };
    }
  }

  return shapeRecords;
}

/**
 *
 * Constructor of SWFBuffer object
 *
 * @param {Buffer} buffer
 * @return Instance of SWFBuffer
 */

function SWFBuffer( buffer ) {
  if ( !Buffer.isBuffer( buffer ) ) {
    throw new Error('Invalid buffer');
  }
  this.buffer = buffer;
  this.pointer = 0;
  this.position = 1;
  this.current = 0;
  this.length = buffer.length;
}

/**
 * Reads unsigned 16 or 32 Little Endian Bits 
 * and advance pointer to next bits / 8 bytes
 *
 * @param {Number} bits
 * @return {Number} Value read from buffer
 */

SWFBuffer.prototype.readUIntLE = function( bits ) {
  var value = 0;
  try {
    value = this.buffer['readUInt' + bits + 'LE'](this.pointer);
    this.pointer += bits / 8;
  } catch ( e ) {
    throw e;
  }
  return value;
};

/**
 * Reads unsigned 8 bit from the buffer
 *
 * @return {Number} Value read from buffer
 */

SWFBuffer.prototype.readUInt8 = function() {
  return this.buffer.readUInt8( this.pointer++ );
};

/**
 * Reads 32-bit unsigned integers value encoded (1-5 bytes)
 *
 * @return {Number} 32-bit unsigned integer
 */

SWFBuffer.prototype.readEncodedU32 = function() {
  var i = 5
    , result = 0
    , nb;

  do
    result += (nb = this.nextByte());
  while((nb & 128) && --i);

  return result;
};

/**
 * Reads an encoded data from buffer and returns a
 * string using the specified character set.
 *
 * @param {String} encoding - defaults to 'utf8'
 * @returns {String} Decoded string
 */

SWFBuffer.prototype.readString = function(encoding) {
  var init = this.pointer;
  while(this.readUInt8() !== EOS);
  return this.buffer.toString(encoding || 'utf8', init, this.pointer - 1);
};

/**
 * Reads RGB value
 *
 * @return {Array} Array of RGB value
 */

SWFBuffer.prototype.readRGB = function() { 
  return [this.readUInt8(), this.readUInt8(), this.readUInt8()];
};

/**
 * Reads RGBA value
 *
 * @return {Array} Array of RGBA value
 */

SWFBuffer.prototype.readRGBA = function() {
  var rgba = this.readRGB();
  rgba.push(this.readUInt8());
  return rgba;
}

/**
 * Reads ShapeWithStyle structure
 * used by the DefineShape tag.
 *
 * @return ShapeWithStyle structure
 */
SWFBuffer.prototype.readShapeWithStyle = function() {
  return {
    fillStyles  : readStyleArray(this, readFillStyle),
    lineStyles  : readStyleArray(this, readLineStyle),
    numFillBits : this.readBits(4),
    numLineBits : this.readBits(4),
    shapeRecords: readShapeRecords(this)
  }
};

/**
 * Reads RECORDHEADER from next tag in the buffer
 *
 * @return {Object} Tag code and length
 */

SWFBuffer.prototype.readTagCodeAndLength = function() { 
  var n = this.readUIntLE(16)
    , tagType = n >> 6
    , tagLength = n & RECORDHEADER_LENTH_FULL; 

  if ( n === 0 )
    return false;

  if ( tagLength === RECORDHEADER_LENTH_FULL )
    tagLength = this.readUIntLE(32); 

  return { code : tagType, length : tagLength };
};

/**
 * Reads RECT format
 *
 * @return {Object} x, y, width and height of the RECT
 */

SWFBuffer.prototype.readRect = function() {

  this.start();

  var NBits = this.readBits(5)
    , Xmin  = this.readBits(NBits, true)/20
    , Xmax  = this.readBits(NBits, true)/20
    , Ymin  = this.readBits(NBits, true)/20
    , Ymax  = this.readBits(NBits, true)/20;

  return {
    x : Xmin,
    y : Ymin,
    width : (Xmax > Xmin ?  Xmax - Xmin : Xmin - Xmax),
    height : (Ymax > Ymin ? Ymax - Ymin : Ymin - Ymax)
  };

}

/**
 * Sets internal pointer to the specified position;
 *
 * @param {Number} pos
 */

SWFBuffer.prototype.seek = function( pos ) {
  this.pointer = pos % this.buffer.length;
};

/**
 * Resets position and sets current to next Byte in buffer
 */
SWFBuffer.prototype.start = function() {
  this.current = this.nextByte();
  this.position = 1;
};

/**
 * Gets next Byte in the buffer and Increment internal pointer
 *
 * @return {Number} Next byte in buffer
 */

SWFBuffer.prototype.nextByte = function() {
  return this.pointer > this.buffer.length ? null : this.buffer[ this.pointer++ ];
};

/**
 * Reads b bits from current byte in buffer
 *
 * @param {Number} b
 * @return {Number} Bits read from buffer
 */

SWFBuffer.prototype.readBits = function( b, signed ) {
  var n = 0
    , r = 0
    , sign = signed && ++n && ((this.current >> (8-this.position++)) & 1) ? -1 : 1;

  while( n++ < b ) {
    if ( this.position > 8 ) this.start();

    r = (r << 1 ) + ((this.current >> (8-this.position++)) & 1);
  }
  return sign * r;
};

/* Exposes class */
exports = module.exports = SWFBuffer;
