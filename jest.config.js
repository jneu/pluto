//
// configuration for running the test suites with jest
//
// run `npm test` from the top-level directory to run jest
//

module.exports = {
  // where to find the tests
  roots: [
    "<rootDir>/lib",
    "<rootDir>/test",
  ],
  moduleFileExtensions: [ "js" ],

  // how to run the tests
  testEnvironment: "node",
  clearMocks: true,

  // how to check for test coverage
  collectCoverage: true,
  collectCoverageFrom: [ "lib/*.js" ],
  coverageDirectory: "coverage",
  coverageProvider: "v8"
};
