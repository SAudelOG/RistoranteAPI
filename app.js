var http = require('http'),
		express = require('express'),
		bodyParser = require('body-parser'),
		mongoose = require('mongoose'),
		config = require('config'),
		router = require('./router'),
		app = express(),
		dbConfig = config.get('database'),
		serverConfig = config.get('server'),
		conStr = 'mongodb://' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.db,
		server;
//config
app.set('port' , serverConfig.port);
app.set('ip' , serverConfig.ip);
//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
//route
router(app);
//create server
server = http.createServer(app); 
//create connection to the database
mongoose.connect(conStr , function(err) {
	'use strict';
	if (err) throw err;
	//make server listen server
	server.listen(app.get('port'), app.get('ip') , function() {
			console.log('Server listening on ' + app.get('ip') + ':' + app.get('port'));
		});
});

module.exports = server;
