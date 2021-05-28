module.exports = {
  roots: [
    "<rootDir>/lib",
    "<rootDir>/test",
  ],
  moduleFileExtensions: [ "js" ],

  testEnvironment: "node",
  clearMocks: true,

  collectCoverage: true,
  collectCoverageFrom: [ "lib/*.js" ],
  coverageDirectory: "coverage",
  coverageProvider: "v8"
};
