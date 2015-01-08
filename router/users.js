var express = require('express');
var assert = require('assert');
var async = require('async');
var jwt = require('jwt-simple'); 
var router = express.Router();
var UserModel = require('./../model/user');
var wrappedResponse = require('./../util').wrappedResponse;
var crypto = require('./../util').crypto;
//Create user
router.post('/', function(req , res , next) {
	'use strict';
	var user = req.body;
	//validate user information
	try {
		assert.strictEqual(typeof user.email , 'string');
		assert.ok(user.email);
		assert.ok(/^(?:[a-z0-9A-Z_.-]+)@(?:[A-Z0-9a-z]+).(?:[a-zA-Z]+)/.test(user.email));
		assert.ok(user.password); 
	}
	catch(e) {
		//return 400 here
		wrappedResponse({ res : res,
						  code : 400,
						  message : 'invalid username or password',
						  data : 'InvalidCredentials' });
		return next();
	}
	//async parallel init...
	async.parallel({
		//encrypt password
		password : function(callback) {
			'use strict';
			crypto.createSalt(512 , function(err , salt) {
				'use strict';
				if (err) return callback(err , null); 
				callback(null , { salt : salt,
						   		  hash : crypto.createHash(user.password , salt , 'sha512') });

			});
		},
		//create token
		token : function(callback) {
			'use strict';
			crypto.createSalt(512 , function(err , salt) {
				'use strict';
				if (err) return callback(err , null);
				var payload = { email : user.email,
								exp   : 3600 };
				callback(null , { salt : salt,
							  	  hash : jwt.encode(payload , salt , 'HS512') }); 
				
			});
		}	
	},
	//finally
	function (err , results) {
		'use strict';
		if (err) return next(err);
		//save user
		user.token = results.token;
		user.password = results.password;
		var newUser = UserModel(user);
		newUser.save(function(err , doc) {
			'use strict';
			if (err) return next(err);
			var body = {
				id : doc._id,
				token : doc.token.hash
			};
			//user inserted, respond with token...
			res.set('Location' , 'http://localhost:3000/users/' + doc._id);
			wrappedResponse({ res : res,
							  code : 201,
							  data : body,
							  message : '' });
			next();
		});
	});
});

//eporting router object
module.exports = router;
