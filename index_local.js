
var app = require('./index');
var http = require('http');


// PORTS
// ===============================================================================
var port = 4050;
app.set('port', port);

// SERVER
// ===============================================================================
var server = http.createServer(app);
// var server = spdy.createServer({},app);

// EVENT BINDING
// ===============================================================================

// ON ERROR
function onError(error) {
    console.log('Error');
    try {
        console.log(error.message)
    
    } catch(err){
        console.log('Error RUN SERVER : '+err);
    }
}

// ON RUNNING
function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log(`${addr.address} > Listening on > ${bind}`);
}

// BIND
server.on('error', onError);
server.on('listening', onListening);

// RUN SERVER
// ===============================================================================
server.listen(port);

