var request = require('request');
var Iconv = require('iconv').Iconv;
var converter = new Iconv('UTF-8', 'GB18030');

var SerialPort = require('serialport').SerialPort;
var port = new SerialPort('/dev/cu.usbserial-AL008SZL', {
    baudRate: 9600
});

port.on('open', function () {
    port.write(new Buffer([27, '@'.charCodeAt(0)]));
    port.write(new Buffer([27, 55, 7, 255, 1]));
    port.write(new Buffer([18, 35, (15 << 4 | 15)]));
    port.write("\n DEVICE BOOT \n");
    setTimeout(recur, 1000);
    //port.write(new byte[]{27, 55, 10, (byte)90, (byte)10});
});


function recur() {
    var r = request('http://localhost:4000/print', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body); try {
                var arr = JSON.parse(body.toString());
                for (var t = 0; t < arr.length; t++) {
                    var j = converter.convert(new Buffer(arr[t] + "\n- - - - - - - - - - - - - - - -\n\n"));
                    console.log(j);
                    port.write(j);
                }
            } catch (e) {

            }
        }
        setTimeout(recur, 500);
    });
}

// var buf = converter.convert(test);
// var test = new Buffer("哈哈哈");
// console.log(buf);
