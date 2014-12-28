var Bitlash = require('../');
var SerialPort = require('serialport');
var async = require('async');

var baud = 115200;

function sendCommand(path, command, done){

  var self = this;
  var timeout = 30000;

  var data;

  var serialPort;
  async.series([
    function(cbStep) {
      serialPort = new SerialPort.SerialPort(path, {
          baudrate: baud
        }, cbStep);
    },
    function(cbStep){
      Bitlash.send(serialPort, cbStep);
    },
    function(cbStep){
      var opt = {
        timeout: 5000,
        cmd: command
      };

      Bitlash.send(serialPort, opt, function(err, results){
        if (err) {
          return cbStep(err);
        }

        data = results;
        cbStep();
      });
    }
  ],
    function(err) {
      serialPort.close();

      done(err, data);
    });
}

if(process && process.argv && process.argv[2] && process.argv[3])
{
  sendCommand(process.argv[2], process.argv[3], function(err, results){
    if(err){
      console.log(err);
      process.exit(1);
    }

    console.log(results);
    console.log('send success!');
    process.exit(0);

  });
}else
{
  console.log('call with /dev/tty.something led.on');
  process.exit(0);
}