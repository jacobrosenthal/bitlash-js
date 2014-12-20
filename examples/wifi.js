var Bitlash = require('../');
var SerialPort = require("serialport");
var async = require('async');
var util = require('util');

var baud = 115200;

function programWifi(path, ssid, pass, done){

  var self = this;
  var timeout = 30000;

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
        cmd: 'led.on'
      };

      Bitlash.send(serialPort, opt, cbStep);
    },
    function(cbStep){
      var opt = {
        timeout: 10000,
        cmd: util.format('wifi.config("%s", "%s")', ssid, pass)
      };

      Bitlash.send(serialPort, opt, cbStep);
    },
    function(cbStep){
      var opt = {
        timeout: 2000,
        cmd: "wifi.reassociate"
      };

      Bitlash.send(serialPort, opt, cbStep);
    },
    function(cbStep){
      var opt = {
        timeout: 2000,
        cmd: 'led.off'
      };

      Bitlash.send(serialPort, opt, cbStep);
    },
    function(cbStep){
      waitWifi(serialPort, 30000, cbStep);
    },
    ],
    function(error) {
      serialPort.close();

      done(error);
    });

};

function waitWifi(serialPort, timeout, done){
  var timedout = false;
  var ctc = false;

  var opt = {
    timeout: 2000,
    cmd: 'wifi.report'
  };

  setTimeout(function() { timedout = true; }, timeout);

  async.whilst (
    function() {
      return (!ctc || timedout); 
    }, 
    function(cbStep) {
      Bitlash.send(serialPort, opt, function(error, response){
        if (error || typeof response === 'undefined') {
          return cbStep(err);
        }
        var resp = JSON.parse(response.toString());
        ctc = JSON.parse(resp.connected);
        cbStep();
      });
    }, 
    function(err) {
      done(err);
    });
}


if(process && process.argv && process.argv[2] && process.argv[3] && process.argv[4])
{
  programWifi(process.argv[2], process.argv[3], process.argv[4], function(error){
    if(error){
      console.log(error);
      process.exit(1);
    }

    console.log("wifi success!");
    process.exit(0);

  });
}else
{
  console.log("call with /dev/tty.something ssid password");
  process.exit(0);
}