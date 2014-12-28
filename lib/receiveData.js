//stream object to read from (node serial port)
//timeout to wait for regexp
//split to split on (new lines)
//callback in form of err, array of strings
module.exports = function (stream, timeout, regexp, callback) {

  var buffer = '';
  var timeoutId = null;

  var handleChunk = function (data) {

    buffer += data.toString('utf8');
    // console.log("buffer", buffer);

    var found = regexp.test(buffer);
    if (found) {
      finished(null, buffer);
    }

  };

  var finished = function (err, chunks) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    stream.removeListener('data', handleChunk);
    // console.log("returning", chunks);
    callback(err, chunks);
  };

  if (timeout && timeout > 0) {
    timeoutId = setTimeout(function () {
      timeoutId = null;
      finished(new Error('receiveData timeout after ' + timeout + 'ms'));
    }, timeout);
  }
  stream.on('data', handleChunk);
};
