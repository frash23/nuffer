"use strict";

var authorizedSockets = [];
var bcrypt = require('bcrypt'); // Use 13 rounds
var io = require('socket.io')(undefined, {serveClient: false});
io.on( 'connection', socket=> socketConnect.call(socket) );
io.listen(7566);

function socketConnect() {
	var authorized = false;
	var authorizing = false;
	log('New connection: Socket ID '+ this.id +' from IP '+ this.handshake.address);

	this.emit('debug', 'Verified connection working both ways');

	this.on('auth', data=> {
		if(authorizing || authorized) return false;

		log('Auth req: '+ data.user +', '+ data.passhash);
		authorizing = true;
		hashPass(data.passhash, hash=> {
			authorizing = false;
			if(hash === null) log('WARN: Problematic socket: '+ this.id);
			else {
				log(hash);
				authorized = true;
				bcrypt.compare('342853667818162828ca12542f0fdcb3dd701a9db6e45bcff275bf0436210525', hash, log);
			}
		});
	});
	
	this.on('disconnect', ()=> {
		var authIndex = authorizedSockets.indexOf(this.id);
		if(authIndex > -1) {
			log('Authorized socket '+ this.id +' disconnected.');
			authorizedSockets[authIndex] = 0;
		} else log('Unathorized socket '+ this.id +' disconneceted');
	});
}

function hashPass(passhash, cb) {
	var start = Date.now();
	var hashTime = 1000;
	bcrypt.hash( String(passhash), 13, (err, hash)=> {
		if(err) { hash = null; log('WARN: Error while authorizing', err); }
		/* If we spent less time than `hashTime`, wait. This avoids timing attacks. */
		var timeToCb = Date.now() - start < hashTime;
		timeToCb = timeToCb < 1? 0 : timeToCb;
		setTimeout(cb, timeToCb, hash);
	});
}

function log() {
	var toLog = Array.prototype.slice.call(arguments);
	var date = new Date();
	var logTime = ('0'+date.getHours()).substr(-2) +':';
	logTime += ('0'+date.getMinutes()).substr(-2) +':';
	logTime += ('0'+date.getSeconds()).substr(-2);
	var logPrefix = '['+ logTime +']';
	toLog.unshift(logPrefix);
	console.log.apply(console, toLog);
	//logToFile( toLog.join(' ') );
}
