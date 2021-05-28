'use strict';

const HeaderExtractorTransform = require('../lib/HeaderExtractorTransform');
const { checkErrorMessage, BlackHole, BuffersSource } = require('./test_utils');
const { pipeline } = require('stream');

function runTestPipeline(chunks, callback) {
  pipeline(
    new BuffersSource(chunks),
    new HeaderExtractorTransform(),
    new BlackHole(),
    callback
  );
}

test('empty', done => {
  runTestPipeline(
    [[]],
    err => { checkErrorMessage(err, 'invalid header', done); }
  );
});

test('one header byte', done => {
  runTestPipeline(
    [[5]],
    err => { checkErrorMessage(err, 'invalid header', done); }
  );
});

test('full header', done => {
  runTestPipeline(
    [[5, 2]],
    done
  );
});

test('full header in pieces', done => {
  runTestPipeline(
    [[5], [2]],
    done
  );
});

test('full header and EOF record', done => {
  runTestPipeline(
    [[5, 2, 0, 0, 0, 0]],
    done
  );
});

test('full header and EOF record in pieces', done => {
  runTestPipeline(
    [[5], [2, 0], [0, 0, 0]],
    done
  );
});

test('full header and EOF record in other pieces', done => {
  runTestPipeline(
    [[5, 2], [0, 0, 0, 0]],
    done
  );
});

test('incorrect first header byte', done => {
  runTestPipeline(
    [[2, 5]],
    err => { checkErrorMessage(err, 'invalid header', done); }
  );
});

test('incorrect second header byte', done => {
  runTestPipeline(
    [[5, 5, 1, 1, 1, 1]],
    err => { checkErrorMessage(err, 'invalid header', done); }
  );
});

test('incorrect second header byte in pieces', done => {
  runTestPipeline(
    [[5], [5, 1, 1, 1, 1]],
    err => { checkErrorMessage(err, 'invalid header', done); }
  );
});
