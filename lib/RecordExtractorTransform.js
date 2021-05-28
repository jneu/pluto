'use strict';

const { Transform } = require('stream');

class RecordExtractorTransform extends Transform {
  constructor(options) {
    // set readableObjectMode so readers always grab records as objects
    super(Object.assign({}, options, { readableObjectMode: true }));

    this.fourBytes = Buffer.alloc(4);
    this.numberOfBytes = 0;

    this._transform = this._transform_read_record_length;
    this._final = callback => { callback(); };
  }

  _transform_read_record_length(chunk, encoding, callback) {
    const numberOfBytesNeeded = 4 - this.numberOfBytes;

    if (chunk.length < numberOfBytesNeeded) {
      chunk.copy(this.fourBytes, this.numberOfBytes, 0, chunk.length);
      this.numberOfBytes += chunk.length;

      this._final = this._final_incomplete;

      return callback();
    }

    chunk.copy(this.fourBytes, this.numberOfBytes, 0, numberOfBytesNeeded);
    this.recordLength = this.fourBytes.readInt32BE();

    if (this.recordLength > 0) {
      this.recordBuffer = Buffer.alloc(this.recordLength);
      this._transform = this._transform_read_record;
      this._final = this._final_incomplete;
    } else if (this.recordLength < 0) {
      this._transform = this._transform_skip_record;
      this._final = this._final_incomplete;
    } else {
      this._transform = (chunk, encoding, callback) => { callback(); };
      this._final = callback => { callback(); };
    }

    if (chunk.length === numberOfBytesNeeded) {
      return callback();
    }

    setImmediate(() => {
      this._transform(chunk.slice(numberOfBytesNeeded), encoding, callback);
    });
  }

  _transform_read_record(chunk, encoding, callback) {
    if (chunk.length < this.recordLength) {
      chunk.copy(this.recordBuffer, this.recordBuffer.length - this.recordLength, 0, chunk.length);
      this.recordLength -= chunk.length;

      return callback();
    }

    chunk.copy(this.recordBuffer, this.recordBuffer.length - this.recordLength, 0, this.recordLength);
    this.push(this.recordBuffer);

    delete this.recordBuffer;
    this.numberOfBytes = 0;
    this._transform = this._transform_read_record_length;
    this._final = callback => { callback(); };

    if (chunk.length === this.recordLength) {
      return callback();
    }

    setImmediate(() => {
      this._transform(chunk.slice(this.recordLength - chunk.length), encoding, callback);
    });
  }

  _transform_skip_record(chunk, encoding, callback) {
    this.recordLength += chunk.length;

    if (this.recordLength < 0) {
      return callback();
    }

    this.numberOfBytes = 0;
    this._transform = this._transform_read_record_length;
    this._final = callback => { callback(); };

    if (this.recordLength === 0) {
      return callback();
    }

    setImmediate(() => {
      this._transform(chunk.slice(-this.recordLength), encoding, callback);
    });
  }

  _final_incomplete(callback) {
    callback(new Error('incomplete record entry'));
  }
}

module.exports = RecordExtractorTransform;
