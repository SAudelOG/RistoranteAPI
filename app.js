'use strict';
var http = require('http'),
	express = require('express'),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	config = require('./config'),
	router = require('./router'),
	app = express(),
	server,
	settings;

//enviornment settings
if (app.get('env') === 'development') {
	settings = config.development;
}
if (app.get('env') === 'production') {
	settings = config.production;
}
//config
app.set('port' , settings.server.port);
app.set('ip' , settings.server.ip);
//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
//route
router(app);
//create server
server = http.createServer(app); 
//create connection to the database
mongoose.connect(settings.database.conStr , function(err) {
	if (err) throw err;
	//make server listen server
	server.listen(app.get('port'), app.get('ip') , function() {
			console.log('Server listening on ' + app.get('ip') + ':' + app.get('port'));
		});
});

module.exports = server;
