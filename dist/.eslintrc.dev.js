"use strict";

module.exports = {
  "extends": ["airbnb-base"],
  env: {
    "node": true,
    "es6": true
  },
  parserOptions: {
    ecmaVersion: 8
  },
  rules: {
    "comma-dangle": 0,
    "max-len": ["error", {
      "code": 200
    }],
    "prefer-destructuring": ["error", {
      "AssignmentExpression": {
        "array": false,
        "object": false
      }
    }],
    "consistent-return": 0 // "import/newline-after-import":0

  }
};