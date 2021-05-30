'use strict';

const { Transform } = require('stream');

class HeaderExtractorTransform extends Transform {
  static magicBytes = [5, 2];

  constructor(options) {
    super(options);

    this._transform = this._transform_first_byte;
    this._final = this._final_no_header;
  }

  _transform_first_byte(chunk, encoding, callback) {
    if (chunk[0] !== HeaderExtractorTransform.magicBytes[0]) {
      return callback(new Error('invalid header'));
    }

    if (chunk.length > 1) {
      return this._transform_second_byte(chunk.slice(1), encoding, callback);
    }

    this._transform = this._transform_second_byte;
    callback();
  }

  _transform_second_byte(chunk, encoding, callback) {
    if (chunk[0] !== HeaderExtractorTransform.magicBytes[1]) {
      return callback(new Error('invalid header'));
    }

    this._transform = (chunk, encoding, callback) => { callback(null, chunk); };
    this._final = callback => { callback(); };

    if (chunk.length > 1) {
      this.push(chunk.slice(1));
    }

    callback();
  }

  _final_no_header(callback) {
    callback(new Error('invalid header'));
  }
}

module.exports.HeaderExtractorTransform = HeaderExtractorTransform;
