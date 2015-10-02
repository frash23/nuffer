"use strict";

var authorizedSockets = [];
var bcrypt = require('bcrypt'); // Use 13 rounds
var io = require('socket.io')(undefined, {serveClient: false});
io.on('connection', socketConnect);
io.listen(7566);

function socketConnect(sock) {
	var authorized = false;
	log('New connection: Socket ID '+ sock.id +' from IP '+ sock.handshake.address);

	sock.emit('debug', 'Verified connection working both ways');

	sock.on('auth', data=> {
		log('Auth req: '+ data.user +', '+ data.passhash);
	});
	
	sock.on('disconnect', ()=> {
		var authIndex = authorizedSockets.indexOf( sock.id );
		if(authIndex > -1) {
			log('Authorized socket '+ sock.id +' disconnected.');
			authorizedSockets[authIndex] = 0;
		} else log('Unathorized socket '+ sock.id +' disconneceted');
	});
}

function auth(sock, user, passhash) {
}

function log() {
	var toLog = Array.prototype.slice.call(arguments);
	var date = new Date();
	var logPrefix = '['+ date.getHours() +':'+ date.getMinutes() +':'+ date.getSeconds() +']';
	toLog.unshift(logPrefix);
	console.log.apply(console, toLog);
	//logToFile( toLog.join(' ') );
}
