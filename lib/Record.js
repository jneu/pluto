'use strict';

class Record {
  constructor(record_buffer) {
    let offset = 0;

    try {
      const count_of_components = record_buffer.readUInt16BE(offset);
      offset += 2;

      const realm_length = record_buffer.readUInt16BE(offset);
      offset += 2;

      if (record_buffer.length < (offset + realm_length)) {
        throw new ERR_OUT_OF_RANGE();
      }
      this.realm = record_buffer.slice(offset, offset + realm_length);
      offset += realm_length;

      this.components = new Array(count_of_components).fill(0).map(x => {
        const component_length = record_buffer.readUInt16BE(offset);
        offset += 2;

        if (record_buffer.length < (offset + component_length)) {
          throw new ERR_OUT_OF_RANGE();
        }
        const component = record_buffer.slice(offset, offset + component_length);
        offset += component_length;

        return component;
      });

      this._name = record_buffer.readInt32BE(offset);
      offset += 4;

      this.timestamp = new Date(1000 * record_buffer.readUInt32BE(offset));
      offset += 4;

      this.key_version = record_buffer.readUInt8(offset);
      offset += 1;

      this._enctype = record_buffer.readUInt16BE(offset);
      offset += 2;

      const key_length = record_buffer.readUInt16BE(offset);
      offset += 2;

      if (record_buffer.length < (offset + key_length)) {
        throw new ERR_OUT_OF_RANGE();
      }
      this.key = record_buffer.slice(offset, offset + key_length);
      offset += key_length;

      if (record_buffer.length >= offset + 4) {
        const new_key_version = record_buffer.readUInt32BE(offset);
        offset += 4;

        if (new_key_version > 0) {
          this.key_version = new_key_version;
        }
      }

      if (record_buffer.length >= offset + 4) {
        this._flags = record_buffer.readUInt32BE(offset);
        offset += 4;
      } else {
        this._flags = null;
      }
    }
    catch (err) {
      throw new Error('incomplete Record');
    }
  }

  get principal() {
    return this.components.join('/') + '@' + this.realm;
  }

  get flags() {
    return (null === this._flags) ? 'unset' : this._flags.toString(16).padStart(8, '0');
  }

  static principalNames = {
    0: 'unknown',
    1: 'principal',
    2: 'service instance',
    3: 'service with host as instance',
    4: 'service with host as components',
    5: 'unique ID',
    6: 'X.509',
    7: 'SMTP email',
    10: 'Windows 2000 UPN',
    11: 'well-known',
    '-128': 'Windows 2000 UPN and SID',
    '-129': 'NT 4 style name',
    '-130': 'NT 4 style name and SID'
  };

  get name() {
    if (this._name in Record.principalNames) {
      return Record.principalNames[this._name];
    }

    return this._name.toString();
  }

  static encodingTypes = {
    0: 'null',
    1: 'des-cbc-crc',
    2: 'des-cbc-md4',
    3: 'des-cbc-md5',
    4: 'des-cbc-raw',
    5: 'des3-cbc-sha',
    6: 'des3-cbc-raw',
    8: 'des-hmac-sha1',
    9: 'id-dsa-with-sha1-CmsOID',
    10: 'md5WithRSAEncryption-CmsOID',
    11: 'sha-1WithRSAEncryption-CmsOID',
    12: 'rc2-cbc-EnvOID',
    13: 'rsaEncryption-EnvOID',
    14: 'id-RSAES-OAEP-EnvOID',
    15: 'des-ede3-cbc-EnvOID',
    16: 'des3-cbc-sha1',
    17: 'aes128-cts-hmac-sha1-96',
    18: 'aes256-cts-hmac-sha1-96',
    19: 'aes128-cts-hmac-sha256-128',
    20: 'aes256-cts-hmac-sha384-192',
    23: 'arcfour-hmac',
    24: 'arcfour-hmac-exp',
    25: 'camellia128-cts-cmac',
    26: 'camellia256-cts-cmac',
    511: 'unknown'
  };

  get enctype() {
    if (this._enctype in Record.encodingTypes) {
      return Record.encodingTypes[this._enctype];
    }

    return this._enctype.toString();
  }

  toString() {
    return [
      this.principal,
      this.key_version,
      this.timestamp.toUTCString(),
      this.name,
      this.enctype,
      this.flags
    ].join(' ');
  }
}

module.exports.Record = Record;
