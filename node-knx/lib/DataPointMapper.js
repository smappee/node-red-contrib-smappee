const ByteBuffer = require('bytebuffer');
const numeral = require('numeral');

// Datapoint types
const dptUnknown = '0.xxx'; // Unofficial type
const dptBooleanData = '1.xxx';
const dpt1BitWithPriorityControl = '2.xxx';
const dpt3BitWithControl = '3.xxx';
const dptCharacterSet = '4.xxx';
const dpt8BitWithoutSign = '5.xxx';
const dpt8BitWithSign = '6.xxx';
const dpt2OctetWithoutSign = '7.xxx';
const dpt2OctetWithSign = '8.xxx';
const dpt2OctetFloatingPointNumber = '9.xxx';
const dptTime = '10.xxx';
const dptDate = '11.xxx';
const dpt4OctetWithoutSign = '12.xxx';
const dpt4OctetWithSign = '13.xxx';
const dpt4OctetFloatingPointNumber = '14.xxx';
const dptAccessControl = '15.xxx';
const dptCharacterString = '16.xxx';
const dptSceneNumber = '17.xxx';
const dptSceneControl = '18.xxx';
const dptDateTime = '19.xxx';
const dptHvac = '20.xxx';

/**
 1.yyy = boolean, like switching, move up/down, step
 2.yyy = 2 x boolean, e.g. switching + priority control
 3.yyy = boolean + 3-bit unsigned value, e.g. dimming up/down
 4.yyy = character (8-bit)
 5.yyy = 8-bit unsigned value, like dim value (0..100%), blinds position (0..100%)
 6.yyy = 8-bit 2's complement, e.g. %
 7.yyy = 2 x 8-bit unsigned value, i.e. pulse counter
 8.yyy = 2 x 8-bit 2's complement, e.g. %
 9.yyy = 16-bit float, e.g. temperature
 10.yyy = time
 11.yyy = date
 12.yyy = 4 x 8-bit unsigned value, i.e. pulse counter
 13.yyy = 4 x 8-bit 2's complement, i.e. pulse counter
 14.yyy = 32-bit float, e.g. temperature
 15.yyy = access control
 16.yyy = string -> 14 characters (14 x 8-bit)
 17.yyy = scene number
 18.yyy = scene control
 19.yyy = time + data
 20.yyy = 8-bit enumeration, e.g. HVAC mode ('auto', 'comfort', 'standby', 'economy', 'protection')
 */

/*

B = 0..1
BB = 0..3
AAAAAAAA = 0..127 for ASCII or 0..255 for 8859_1
UUUUUUUU = 0..255
UUUUUUUU UUUUUUUU = 0..65535
VVVVVVVV = -128..127
VVVVVVVV VVVVVVVV = -32768..32767
r = 0

Boolean data
B

1 bit with priority control
BB

3 bit with control
BUUU

Character set
AAAAAAAA

8 bit without sign
UUUUUUUU

8 bit with sign
VVVVVVVV

2 octet without sign
UUUUUUUU UUUUUUUU

2 octet with sign
VVVVVVVV VVVVVVVV

2 octet floating point number
MEEEEMMM MMMMMMMM

Time
NNNUUUUU rrUUUUUU rrUUUUUU

Date
rrrUUUUU rrrrUUUU rUUUUUUU

Date + time
UUUUUUUU rrrrUUUU rrrUUUUU UUUUUUUU rrUUUUUU rrUUUUUU BBBBBBBB Brrrrrrr

4 octet without sign
UUUUUUUU UUUUUUUU UUUUUUUU UUUUUUUU

4 octet with sign
VVVVVVVV VVVVVVVV VVVVVVVV VVVVVVVV

4 octet floating point number
FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF

Access control
UUUUUUUU UUUUUUUU UUUUUUUU bbbbNNNN

Character string
AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA

Scene number
rrUUUUUU

Scene control
BrUUUUUU

Common HVAC datapoint types
NNNNNNNN

 */

class DatapointMapper {

  static getDptResult(value) {
    const binaryData = [];
    const buffer = ByteBuffer.wrap(value);

    for (let byte of buffer.buffer) {
      const binaryByte = numeral((byte).toString(2)).format('00000000');
      binaryData.push(binaryByte);
    }

    const rawBinary = {
      binary: binaryData.join(''),
    };

    let output = {};

    switch (value.length) {
      case 1:
        output = DatapointMapper.format1ByteResult(binaryData);
        break;
      case 2:
        output = DatapointMapper.format2BytesResult(binaryData);
        break;
      case 3:
        output = DatapointMapper.format3BytesResult(binaryData);
        break;
      case 4:
        output = DatapointMapper.format4BytesResult(binaryData);
        break;
      case 8:
        output = DatapointMapper.format8BytesResult(binaryData);
        break;
      case 14:
        output = DatapointMapper.format14BytesResult(binaryData);
        break;
      default:
        console.log(`Unmapped length: ${length}`);
        break;
    }

    // return Object.assign(rawBinary, output)
    return binaryData.join(' ');
  }

  static format1ByteResult(binaryData) {
    const data = binaryData[0];
    const result = {};

    // Boolean data
    // rrrrrrrB
    result['booleanData'] = {
      b: parseInt(data[7], 2),
    };

    // 1 bit with priority control
    // rrrrrrBB
    result['1BitWithPriorityControl'] = {
      c: parseInt(data[6], 2),
      v: parseInt(data[7], 2),
    };

    // 3 bit with control
    // rrrrBUUU
    result['3BitWithControl'] = {
      c: parseInt(data[4], 2),
      stepCode: parseInt(data.substr(5), 2),
    };

    // Character set
    // AAAAAAAA

    // 8 bit without sign
    // UUUUUUUU
    result['8BitWithoutSign'] = {
      value: parseInt(data, 2),
    };

    // 8 bit with sign
    // VVVVVVVV

    // Scene number
    // rrUUUUUU
    result['sceneNumber'] = {
      value: parseInt(data.substr(2), 2),
    };

    // Scene control
    // BrUUUUUU
    result['sceneControl'] = {
      C: parseInt(data[0], 2),
      sceneNumber: parseInt(data.substr(2), 2),
    };

    // Common HVAC datapoint types
    // NNNNNNNN
    result['hvac'] = {
      value: parseInt(data, 2),
    };

    return result;
  }

  static format2BytesResult(binaryData) {
    const result = {};

    // 2 octet without sign
    // UUUUUUUU UUUUUUUU

    // 2 octet with sign
    // VVVVVVVV VVVVVVVV

    // 2 octet floating point number
    // MEEEEMMM MMMMMMMM

    return result;
  }

  static format3BytesResult(binaryData) {
    const result = {};

    // Time
    // NNNUUUUU rrUUUUUU rrUUUUUU

    // Date
    // rrrUUUUU rrrrUUUU rUUUUUUU

    return result;
  }

  static format4BytesResult(value) {
    const result = {};

    // 4 octet without sign
    // UUUUUUUU UUUUUUUU UUUUUUUU UUUUUUUU

    // 4 octet with sign
    // VVVVVVVV VVVVVVVV VVVVVVVV VVVVVVVV

    // 4 octet floating point number
    // FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF

    // Access control
    // UUUUUUUU UUUUUUUU UUUUUUUU bbbbNNNN

    return result;
  }

  static format8BytesResult(binaryData) {
    const result = {};

    // Date + time
    // UUUUUUUU rrrrUUUU rrrUUUUU UUUUUUUU rrUUUUUU rrUUUUUU BBBBBBBB Brrrrrrr

    return result;
  }

  static format14BytesResult(binaryData) {
    const result = {};

    // Character string
    // AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA AAAAAAAA

    return result;
  }

  static getValueForDatapointType(value, dpt) {
    const buffer = ByteBuffer.wrap(value);

    let result = value;

    switch (dpt) {
      case dptBooleanData:
        result = buffer.readByte();

        // Only parse values
        if (result === 0 || result === 1) {
          value = result === 1;
        } else {
          console.log(`Unknown value for boolean: ${result}`);
        }

        break;
      case dptTime:
        // Format the numbers as binary
        const time1 = numeral((buffer.readByte(0)).toString(2)).
          format('00000000');
        const time2 = numeral((buffer.readByte(1)).toString(2)).
          format('00000000');
        const time3 = numeral((buffer.readByte(2)).toString(2)).
          format('00000000');

        value = `${time1} ${time2} ${time3}`;
        break;
      case dpt2OctetFloatingPointNumber:
        result = buffer.readInt16();

        value = result;
        break;
      case dpt4OctetFloatingPointNumber:
        result = buffer.readFloat32(0);

        value = result;
        break;
      case dptUnknown:
      // Fallthrough
      default:
        // TODO Is a generic read possible?

        return value;
        break;
    }

    return value;
  }

}

module.exports = DatapointMapper;
