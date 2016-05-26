var express = require("express");
var app = express();
var fs = require('fs');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var Iconv = require('iconv').Iconv;
var converter = new Iconv('UTF-8', 'GB18030');


app.use(serveStatic(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post("/create", function (req, res) {
    if (req.body.txt && req.body.txt.trim().length > 0) {
        push(req.body.txt);
        res.status(200).json({}).end();
    }
});

var _pendingreq = undefined;

app.get("/print", function (req, res) {
    var todo = [];
    for (var i = 0; i < data.length; i++) {
        if (!data[i].printed) {
            todo.push(data[i].txt);
            data[i].printed = true;
            schedulesave();
        }
    }
    if (todo.length == 0) {
        if (_pendingreq) {
            try {
                _pendingreq.status(200).json([]);
            } catch (e) { }
        }
        _pendingreq = res;
        return;
    } else {
        res.status(200).json(todo);
    }
});

io.on("connection", function (socket) {
    socket.emit("new", data);
});


http.listen(4000);



var max_len = 500;
var data = [];

try {
    data = JSON.parse(fs.readFileSync("data.json").toString());
}
catch (e) {
}

function push(txt) {
    var test = new Buffer(txt);
    data.unshift({
        printed: false,
        txt: txt,
        time: Date.now()
    });
    if (data.length > max_len) {
        data.pop();
    }
    try{
        if (_pendingreq && !data[0].printed) {
            _pendingreq.status(200).json([txt]);
            data[0].printed = true;
            _pendingreq = undefined;
        }
    }catch(e){
        
    }
    io.emit("data", data[0]);
    schedulesave();
}


var timer = 0;
function schedulesave() {
    clearTimeout(timer);
    setTimeout(function () {
        fs.writeFileSync("data.json", JSON.stringify(data));
    }, 3000);
}