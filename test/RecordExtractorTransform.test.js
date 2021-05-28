'use strict';

const RecordExtractorTransform = require('../lib/RecordExtractorTransform');
const {
  checkBuffers,
  checkErrorMessage,
  BuffersSource,
  Collector
} = require('./test_utils');
const { pipeline } = require('stream');

function runTestPipeline(chunks, collection, callback) {
  pipeline(
    new BuffersSource(chunks),
    new RecordExtractorTransform(),
    new Collector(collection),
    callback
  );
}

test('empty', done => {
  const collection = [];

  runTestPipeline(
    [],
    collection,
    err => { checkBuffers(err, [], collection, done); }
  );
});

test('EOF', done => {
  const collection = [];

  runTestPipeline(
    [
      [0],
      [0, 0, 0],
      [1],
      [2, 3, 4]
    ],
    collection,
    err => { checkBuffers(err, [], collection, done); }
  );
});

test('incomplete record length', done => {
  const collection = [];

  runTestPipeline(
    [
      [0]
    ],
    collection,
    err => { checkErrorMessage(err, 'incomplete record entry', done); }
  );
});

test('skip', done => {
  const collection = [];

  runTestPipeline(
    [
      [0xff, 0xff, 0xff, 0xff],
      [1]
    ],
    collection,
    err => { checkBuffers(err, [], collection, done); }
  );
});

test('skip with EOF', done => {
  const collection = [];

  runTestPipeline(
    [
      [0xff, 0xff, 0xff, 0xff],
      [1, 0, 0, 0, 0]
    ],
    collection,
    err => { checkBuffers(err, [], collection, done); }
  );
});

test('incomplete skip', done => {
  const collection = [];

  runTestPipeline(
    [
      [0xff, 0xff, 0xff, 0xfe, 0]
    ],
    collection,
    err => { checkErrorMessage(err, 'incomplete record entry', done); }
  );
});

test('one record', done => {
  const collection = [];

  runTestPipeline(
    [
      [0, 0, 0, 1, 2]
    ],
    collection,
    err => { checkBuffers(err, [[2]], collection, done); }
  );
});

test('two records', done => {
  const collection = [];

  runTestPipeline(
    [
      [0, 0, 0, 1, 2, 0, 0, 0, 2, 3],
      [4]
    ],
    collection,
    err => { checkBuffers(err, [[2], [3, 4]], collection, done); }
  );
});
