/**
 * Defines constants on exports object
 *
 * @param {String} name
 * @param {Mixed} value
 */

function define(name, value) {
  Object.defineProperty(exports, name, {
    value       : value,
    enumerable  : true
  });
}

/* SWF Tags Type */

define('End', 0);
define('ShowFrame', 1);
define('DefineShape', 2);
define('PlaceObject', 4);
define('RemoveObject', 5);
define('DefineBits', 6);
define('DefineButton', 7);
define('JPEGTables', 8);
define('SetBackgroundColor', 9);
define('DefineFont', 10);
define('DefineText', 11);
define('DoAction', 12);
define('DefineFontInfo', 13);
define('DefineSound', 14);
define('StartSound', 15);
define('DefineButtonSound', 17);
define('SoundStreamHead', 18);
define('SoundStreamBlock', 19);
define('DefineBitsLossless', 20);
define('DefineBitsJPEG2', 21);
define('DefineShape2', 22);
define('DefineButtonCxform', 23);
define('Protect', 24);
define('PlaceObject2', 26);
define('RemoveObject2', 28);
define('DefineShape3', 32);
define('DefineText2', 33);
define('DefineButton2', 34);
define('DefineBitsJPEG3', 35);
define('DefineBitsLossless2', 36);
define('DefineEditText', 37);
define('DefineSprite', 39);
define('SerialNumber', 41);
define('FrameLabel', 43);
define('SoundStreamHead2', 45);
define('DefineMorphShape', 46);
define('DefineFont2', 48);
define('ExportAssets', 56);
define('ImportAssets', 57);
define('EnableDebugger', 58);
define('DoInitAction', 59);
define('DefineVideoStream', 60);
define('VideoFrame', 61);
define('DefineFontInfo2', 62);
define('EnableDebugger2', 64);
define('ScriptLimits', 65);
define('SetTabIndex', 66);
define('FileAttributes', 69);
define('PlaceObject3', 70);
define('ImportAssets2', 71);
define('DefineFontAlignZones', 73);
define('CSMTextSettings', 74);
define('DefineFont3', 75);
define('SymbolClass', 76);
define('Metadata', 77);
define('DefineScalingGrid', 78);
define('DoABC', 82);
define('DefineShape4', 83);
define('DefineMorphShape2', 84);
define('DefineSceneAndFrameLabelData', 86);
define('DefineBinaryData', 87);
define('DefineFontName', 88);
define('StartSound2', 89);
define('DefineBitsJPEG4', 90);
define('DefineFont4', 91);
//define('TagMax' (DefineFont4 + 1)
