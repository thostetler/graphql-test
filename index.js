require('babel-polyfill');
require('babel-register')({
  presets: [ 'env' ],
  "plugins": [
    ["transform-object-rest-spread", { "useBuiltIns": true }]
  ]
});

// Import the rest of our application.
module.exports = require('./server.js');
