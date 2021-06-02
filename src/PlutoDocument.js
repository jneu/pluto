'use strict';

const {
  HeaderExtractorTransform,
  Record,
  RecordExtractorTransform
} = require('../lib/pluto');

const { pipeline, Readable, Writable } = require('stream');

class PlutoDocument {
  constructor(uri) {
    this.uri = uri;
    this.records = [];
  }

  dispose() { }

  static assemble(uri, thenableData) {
    const customDocument = new PlutoDocument(uri);

    function fileContentPipeline(fileContent) {
      const fileBytesSource = new Readable({
        read(size) {
          this.push(fileContent);
          this.push(null);
        }
      });

      const recordCollector = new Writable({
        writev: (chunks, callback) => {
          chunks.forEach(x => { customDocument.records.push(new Record(x.chunk)); });
          callback();
        }
      });

      const recordPipeline = new Promise((resolve, reject) => {
        pipeline(
          fileBytesSource,
          new HeaderExtractorTransform(),
          new RecordExtractorTransform(),
          recordCollector,
          err => {
            if (err) {
              reject(err);
            } else {
              resolve(customDocument);
            }
          }
        );
      });

      return recordPipeline;
    }

    return thenableData.then(fileContentPipeline);
  }
}

module.exports.PlutoDocument = PlutoDocument;
