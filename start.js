// compile file when loaded
require('@babel/register')({
    // contains set of plugins to convert 
    presets: ['@babel/preset-env']
});

// start executing the application code
module.exports = require('./app');