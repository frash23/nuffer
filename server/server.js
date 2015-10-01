"use strict";

var authorizedSockets = [];
var io = require('socket.io')(undefined, {serveClient: false});
io.on('connection', socketConnect);
io.listen(7566);

function socketConnect(sock) {
	log('New connection: Socket ID '+ sock.id +' from IP '+ sock.handshake.address);
	sock.emit('chatMsg', 'lololol');

	sock.on( 'disconnect', ()=> socketDisconnect(sock) );
	sock.on( 'auth', data=> auth(data.user, data.passhash) );
}

function socketDisconnect(sock) {
	var authIndex = authorizedSockets.indexOf( sock.id );
	if(authIndex > -1) {
		log('Authorized socket '+ sock.id +' disconnected.');
		authorizedSockets[authIndex] = 0;
	} else log('Unathorized socket '+ sock.id +' disconneceted');
};

function auth(user, passhash) {
	log('Auth req: '+ user +', '+ passhash);
}

function log() {
	var toLog = Array.prototype.slice.call(arguments);
	var date = new Date();
	var logPrefix = '['+ date.getHours() +':'+ date.getMinutes() +':'+ date.getSeconds() +']';
	toLog.unshift(logPrefix);
	console.log.apply(console, toLog);
	//logToFile( toLog.join(' ') );
}
