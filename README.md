##bitlash-js
parse and send commands to bitlash devices via a stream interface like [serialport](https://www.npmjs.com/package/serialport)

###INSTALL
```
npm install bitlash-js
```

####Use:
See examples folder, but the steps are simple. You need a stream object, commonly [serialport](https://www.npmjs.com/package/serialport) with the correct speed for your chip (115200 for pinoccio) and path to your device  :
```
var SerialPort = require("serialport");
var serialPort = new SerialPort.SerialPort(path, {
  baudrate: baud
});
```

With [serialport](https://www.npmjs.com/package/serialport), you need to wait for your open event, but then you can send an empty command to make sure bitlash is listening
```
var Bitlash = require('bitlash-js');

Bitlash.send(serialPort, function(error){
  if(error) throw error;
});
```

Then send away. results is an array of strings, broken up by new line with your echoed command and the prompt removed. For commands that have no return like led.on its an empty array.

```
var opt = {
  timeout: 5000,
  cmd: 'led.on'
};

Bitlash.send(serialPort, function(error, results){
  if(error) throw error;
});

```

###CHANGELOG
0.0.1 
forked from stk500 for its serial parser style

0.1.0 
working implementation with tests

