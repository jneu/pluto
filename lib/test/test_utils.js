'use strict';

const { Readable, Writable } = require('stream');

class BlackHole extends Writable {
  constructor() {
    super({
      writev: (chunks, callback) => { callback(); }
    });
  }
}

class BuffersSource extends Readable {
  constructor(chunks) {
    super({
      read: size => {
        while (chunks.length > 0) {
          if (!this.push(Buffer.from(chunks.shift()))) {
            return;
          }
        }

        this.push(null);
      }
    });
  }
}

class Collector extends Writable {
  constructor(collection) {
    super({
      writev: (chunks, callback) => {
        chunks.forEach(x => { collection.push(x.chunk); });
        callback();
      }
    });
  }
}

function checkBuffers(err, expected, collection, done) {
  try {
    expect(err).not.toEqual(expect.anything());
    expect(collection).toHaveLength(expected.length);
    collection.forEach((x, i) => {
      expect(x.compare(Buffer.from(expected[i]))).toBe(0);
    });
    done();
  } catch (error) {
    done(error);
  }
}

function checkErrorMessage(err, message, done) {
  try {
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe(message);
    done();
  } catch (error) {
    done(error);
  }
}

module.exports = {
  checkBuffers,
  checkErrorMessage,
  BlackHole,
  BuffersSource,
  Collector
};
