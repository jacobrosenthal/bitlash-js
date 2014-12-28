var receiveData = require('./receiveData');
var PROMPTREGEX = require('../lib/statics').PROMPT;
var SPLITREGEX = require('../lib/statics').SPLIT;

module.exports = function (stream, opt, callback) {

  var args = Array.prototype.slice.call(arguments);
  callback = args.pop();
  if (typeof(callback) !== 'function') {
    callback = opt;
  }

  options = (typeof opt !== 'function') && opt || {};

  var timeout = options.timeout || 60000;
  var promptRegex = options.promptRegex || PROMPTREGEX;
  var splitRegex = options.splitRegex || SPLITREGEX;
  var cmd = options.cmd || '';
  var echo = options.echo || false;
  var error;

  stream.write(new Buffer(cmd + '\n'), function (err) {
    if (err) {
      error = new Error('Sending ' + cmd + ': ' + err.message);
      return callback(error);
    }

    receiveData(stream, timeout, promptRegex, function (err, data) {
      if (err) {
        error = new Error('Sending ' + cmd + ': ' + err.message);
        return callback(error);
      }

      data = data.split(splitRegex);

      //dump the prompt
      if(data.length>=1 && data.pop() !== '> ' ) {
        error = new Error('Sending ' + cmd + ': Prompt not at end');
        return callback(error);
      }

      if(data.length > 0 && data[1] === 'unexpected number'){
        error = new Error('Sending ' + cmd + ': Device reports invalid command');
        return callback(error);
      }

      //if echo off, dump the command
      if(data.length>=1 && !echo) { data.shift(); }

      //TODO convert to type?
      callback(null, data);
    });
  });
};