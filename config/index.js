var nconf  = require("nconf")
    , path = require("path")
    , log = require('../lib/log')
    , env  = process.env.NODE_ENV;

if (['live', 'local'].indexOf(env) === -1) {
    console.log('Unknown environment, use "local"');
    process.env.NODE_ENV = env = 'local';
}

nconf.argv().env().file(path.join(__dirname, env + '.json'));

module.exports = nconf;