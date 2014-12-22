var chai = require('chai');
var expect = chai.expect;

var receiveData = require('../lib/receiveData');
var sendCommand = require('../lib/sendCommand');
var es = require('event-stream');

var PROMPTREGEX = require('../lib/statics').PROMPT;
var SPLITREGEX = require('../lib/statics').SPLIT;

var greeting = 'Hello from Pinoccio!\r\n (Shell based on Bitlash v2.0 (c) 2014 Bill Roy)\r\n Custom Sketch (rev unknown)\r\n 15837 bytes free\r\n Field Scout ready\r\n';
var prompt = '> ';

var EventEmitter = require('events').EventEmitter;

var hardware = new EventEmitter();

hardware.write = function(data, callback){
  callback(null, data);
  this.insert(data + "\r\n");
}

hardware.insert = function(data){
  this.emit('data', data);
}

describe('sendCommands', function () {
  afterEach(function () {
    hardware.removeAllListeners();
  });


  it('should take no options', function (done) {

    sendCommand(hardware, function (err, data) {
      expect(err).to.not.be.ok;
      expect(data).to.exist;
      done();
    });
    process.nextTick(function(){
      hardware.insert(greeting + prompt);
    });
  });

  it('should take null options', function (done) {

    sendCommand(hardware, null, function (err, data) {
      expect(err).to.not.be.ok;
      done();
    });
    process.nextTick(function(){
      hardware.insert(greeting + prompt);
    });
  });

  it('should take no options', function (done) {

    sendCommand(hardware, {}, function (err, data) {
      expect(err).to.not.be.ok;
      expect(data).to.exist;
      done();
    });
    process.nextTick(function(){
      hardware.insert(greeting + prompt);
    });
  });

  it('should timeout', function (done) {
    var opt = {
      timeout: 10
    };

    sendCommand(hardware, opt, function (err, data) {
      expect(err).to.exist;
      done();
    });

  });


  it('should echo commands', function (done) {
    var opt = {
      timeout: 10,
      echo: true,
      cmd: 'led.on'
    };

    sendCommand(hardware, opt, function (err, data) {
      expect(err).to.not.be.ok;
      expect(data).to.exist;
      expect(data).to.deep.include.members(['led.on']);
      done();
    });
    process.nextTick(function(){
      hardware.insert(prompt);
    });
  });

  it('should return empty for commands with no response', function (done) {
    var opt = {
      timeout: 10,
      cmd: 'led.on'
    };

    sendCommand(hardware, opt, function (err, data) {
      expect(err).to.not.be.ok;
      expect(data).to.exist;
      expect(data).to.deep.include.members([]);
      done();
    });
    process.nextTick(function(){
      hardware.insert(prompt);
    });
  });

  it('should return response for commands with response', function (done) {
    var opt = {
      timeout: 10,
      echo: true,
      cmd: 'print power.isvccenabled'
    };

    sendCommand(hardware, opt, function (err, data) {
      expect(err).to.not.be.ok;
      expect(data).to.exist;
      expect(data).to.deep.include.members(['1']);
      done();
    });
    process.nextTick(function(){
      hardware.insert('1\r\n' + prompt);
    });
  });

});
