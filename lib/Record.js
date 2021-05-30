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

      this.name = record_buffer.readUInt32BE(offset);
      offset += 4;

      this.timestamp = new Date(1000 * record_buffer.readUInt32BE(offset));
      offset += 4;

      this.key_version = record_buffer.readUInt8(offset);
      offset += 1;

      this.enctype = record_buffer.readUInt16BE(offset);
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
        this.flags = record_buffer.readUInt32BE(offset);
        offset += 4;
      } else {
        this.flags = null;
      }
    }
    catch (err) {
      throw new Error('incomplete Record');
    }
  }

  toString() {
    return [
      this.components.join('/') + '@' + this.realm,
      this.key_version,
      this.timestamp.toUTCString(),
      this.name,
      this.enctype,
      (null === this.flags) ? 'no flags' : this.flags
    ].join(' ');
  }
}

module.exports.Record = Record;
