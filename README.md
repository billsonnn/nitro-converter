### Nitro Converter

# What files does this tool convert?

The converter currently supports the following files:

- furnidata.xml
- figuredata.xml
- figuremap.xml
- effectmap.xml
- external_texts.txt
- productdata.txt
- Furniture swfs
- Pet swfs
- Figure swfs
- Effect swfs

# Configuration

You must rename `configuration.json.example` to `configuration.json`

The simplest way to set your configuration is by changing the `external.variables.url` option. The converter will pull all urls from this file if the main configuration has them set to `null or ""`

You may set any of the urls to a local path on your system or a remote url. A local path is recommended as the tool will run a lot quicker for downloading.

| key | value |
| ------ | ------ |
| output.folder | The folder where converted assets will be saved to |
| flash.client.url | The base url where figures/pets/effects are stored, eg https://url/gordon/  |
| furnidata.load.url | The url to your furnidata, can be XML or JSON, eg https://url/gamedata/furnidata.xml |
| productdata.load.url | The url to your productdata.txt, eg https://url/gamedata/productdata.txt |
| figuremap.load.url | The url to your figure map, can be XML or JSON, eg https://url/gordon/figuremap.xml |
| effectmap.load.url | The url to your effect map, can be XML or JSON, eg https://url/gordon/effectmap.xml |
| dynamic.download.pet.url | The full url where pets are stored, eg https://url/gordon/%className%.swf  |
| dynamic.download.figure.url | The full url where figures are stored, eg https://url/gordon/%className%.swf  |
| dynamic.download.effect.url | The full url where effects are stored, eg https://url/gordon/%className%.swf  |
| flash.dynamic.download.url | The base url where furniture is stored, eg https://url/dcr/hof_furni/ |
| dynamic.download.furniture.url | The full url where furniture is stored, eg https://url/dcr/hof_furni/%className%.swf |
| external.variables.url | The url to your external variables, eg https://url/gamedata/external_variables.txt |
| external.texts.url | The url to your external texts, eg https://url/gamedata/external_texts.txt |
| convert.productdata | Either `0` to skip or `1` to run |
| convert.externaltexts | Either `0` to skip or `1` to run |
| convert.figure | Either `0` to skip or `1` to run |
| convert.figuredata | Either `0` to skip or `1` to run |
| convert.effect | Either `0` to skip or `1` to run |
| convert.furniture | Either `0` to skip or `1` to run |
| convert.pet | Either `0` to skip or `1` to run |

# Running the converter

To run the converter open a new terminal / console window in the main converter directory.

**Make sure you run ``npm i`` before first use.**

Type `npm start` and the converter will start running, only errors will be outputted in the console.

The converter will skip any assets that already exist but will always reconvert your XMLs / copy your JSONS to the ``gamedata`` folder to ensure you always have the latest copy.
