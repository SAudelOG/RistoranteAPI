var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var app = express();
var router = require('./router');
//config

//middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false }));
//route
router(app);
//listen
var server = http.createServer(app);
//create connection to the database
mongoose.connect('mongodb://localhost:27017/playing' , function(err) {
	'use strict';
	if (err) throw err;
	server.listen(3000, function() {
		console.log('Server listening on http://localhost:3000');
	});
});

module.exports = server;
