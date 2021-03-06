'use strict';

const { Record } = require('../pluto');

test('basic record', () => {
  const basic_buffer = Buffer.from([
    0x00, 0x01, 0x00, 0x0b, 0x45, 0x58, 0x41, 0x4d, 0x50, 0x4c, 0x45, 0x2e,
    0x43, 0x4f, 0x4d, 0x00, 0x07, 0x73, 0x6f, 0x6d, 0x65, 0x6f, 0x6e, 0x65,
    0x00, 0x00, 0x00, 0x01, 0x60, 0x79, 0xd1, 0x65, 0x07, 0x00, 0x14, 0x00,
    0x20, 0x44, 0xbd, 0x7c, 0xcb, 0xbf, 0x63, 0xe0, 0x4e, 0x9d, 0x67, 0x36,
    0x84, 0xa3, 0xd7, 0x34, 0xac, 0x20, 0xbf, 0x30, 0x4f, 0xcb, 0x83, 0x46,
    0x5c, 0x0e, 0x97, 0xea, 0x8e, 0x9e, 0xa6, 0xa8, 0x53, 0x00, 0x00, 0x00,
    0x07
  ]);

  const recordString = new Record(basic_buffer).toString();
  expect(recordString).toBe('someone@EXAMPLE.COM 7 Fri, 16 Apr 2021 18:03:17 GMT principal aes256-cts-hmac-sha384-192 unset');
});

test('flags record', () => {
  const flags_buffer = Buffer.from([
    0x00, 0x01, 0x00, 0x0b, 0x45, 0x58, 0x41, 0x4d, 0x50, 0x4c, 0x45, 0x2e,
    0x43, 0x4f, 0x4d, 0x00, 0x07, 0x73, 0x6f, 0x6d, 0x65, 0x6f, 0x6e, 0x65,
    0x00, 0x00, 0x00, 0x20, 0x60, 0x79, 0xd1, 0x65, 0x07, 0x00, 0x21, 0x00,
    0x20, 0x44, 0xbd, 0x7c, 0xcb, 0xbf, 0x63, 0xe0, 0x4e, 0x9d, 0x67, 0x36,
    0x84, 0xa3, 0xd7, 0x34, 0xac, 0x20, 0xbf, 0x30, 0x4f, 0xcb, 0x83, 0x46,
    0x5c, 0x0e, 0x97, 0xea, 0x8e, 0x9e, 0xa6, 0xa8, 0x53, 0x00, 0x00, 0x00,
    0x07, 0x01, 0x02, 0x03, 0x04
  ]);

  const recordString = new Record(flags_buffer).toString();
  expect(recordString).toBe('someone@EXAMPLE.COM 7 Fri, 16 Apr 2021 18:03:17 GMT 32 33 01020304');
});

test('incomplete realm', () => {
  const incomplete_buffer = Buffer.from([
    0x00, 0x01, 0x00, 0x0b, 0x45, 0x58, 0x41, 0x4d, 0x50, 0x4c, 0x45, 0x2e,
    0x43, 0x4f
  ]);

  expect(() => new Record(incomplete_buffer)).toThrow(/^incomplete Record$/);
});

test('incomplete component', () => {
  const incomplete_buffer = Buffer.from([
    0x00, 0x01, 0x00, 0x0b, 0x45, 0x58, 0x41, 0x4d, 0x50, 0x4c, 0x45, 0x2e,
    0x43, 0x4f, 0x4d, 0x00, 0x07, 0x73, 0x6f, 0x6d, 0x65, 0x6f, 0x6e
  ]);

  expect(() => new Record(incomplete_buffer)).toThrow(/^incomplete Record$/);
});

test('incomplete key', () => {
  const incomplete_buffer = Buffer.from([
    0x00, 0x01, 0x00, 0x0b, 0x45, 0x58, 0x41, 0x4d, 0x50, 0x4c, 0x45, 0x2e,
    0x43, 0x4f, 0x4d, 0x00, 0x07, 0x73, 0x6f, 0x6d, 0x65, 0x6f, 0x6e, 0x65,
    0x00, 0x00, 0x00, 0x01, 0x60, 0x79, 0xd1, 0x65, 0x07, 0x00, 0x14, 0x00,
    0x20, 0x44, 0xbd, 0x7c, 0xcb, 0xbf, 0x63, 0xe0, 0x4e, 0x9d, 0x67, 0x36,
    0x84, 0xa3, 0xd7, 0x34, 0xac, 0x20, 0xbf, 0x30, 0x4f, 0xcb, 0x83, 0x46,
    0x5c, 0x0e, 0x97, 0xea, 0x8e, 0x9e, 0xa6, 0xa8
  ]);

  expect(() => new Record(incomplete_buffer)).toThrow(/^incomplete Record$/);
});
