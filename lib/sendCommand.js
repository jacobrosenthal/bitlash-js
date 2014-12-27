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

  cmd = cmd + "\n";

  // console.log('sending', cmd);
  stream.write(new Buffer(cmd), function (err) {
    if (err) {
      return callback(err);
    }
    // console.log("sent");
    receiveData(stream, timeout, promptRegex, function (err, data) {
      if (err) return callback(err, data);

      data = data.split(splitRegex);

      //dump the prompt
      if(data.length>=1 && data.pop() !== '> ' ) return callback(new Error('Prompt not at end?'));

      if(data.length > 0 && data[1] === "unexpected number"){
        return callback(new Error("device reports invalid command"));
      }

      //if echo off dump the command
      if(data.length>=1 && !echo) data.shift();

      // console.log("data", data);

      //TODO convert to type?
      callback(err, data);
    });
  });
};