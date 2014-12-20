var chai = require('chai');
var expect = chai.expect;

var receiveData = require('../lib/receiveData');
var es = require('event-stream');
var PROMPTREGEX = require('../lib/statics').PROMPT;

var greeting = 'Hello from Pinoccio!\r\n (Shell based on Bitlash v2.0 (c) 2014 Bill Roy)\r\n Custom Sketch (rev unknown)\r\n 15837 bytes free\r\n Field Scout ready\r\n> ';

describe('receiveData', function () {
  beforeEach(function () {
    this.port = es.through(function (data) {
      this.emit('data', data);
    });
  });

  it('should return with a token (in practice greeting may get cut so shouldnt necessarily match)', function (done) {
    receiveData(this.port, 10, PROMPTREGEX, function (err, data) {
      expect(err).to.not.be.ok;
      expect(data).to.exist;
      done();
    });
    this.port.write(greeting);
  });

  it('should timeout', function (done) {
    receiveData(this.port, 10, PROMPTREGEX, function (err, data) {
      expect(err).to.be.ok;
      done();
    });
    this.port.write(greeting.slice(0,1));
  });

  it('should receive a buffer in chunks', function (done) {
    receiveData(this.port, 10, PROMPTREGEX, function (err, data) {
      expect(err).to.not.be.ok;
      expect(data).to.exist;
      expect(data).to.eq(greeting);
      done();
    });
    this.port.write(greeting.slice(0,1));
    this.port.write(greeting.slice(1,greeting.length));
  });

});
