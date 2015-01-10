var express = require('express'),
		assert = require('assert'),
		async = require('async'),
		jwt = require('jwt-simple'),
		router = express.Router(),
		UserModel = require('./../model/user'),
		wrappedResponse = require('./../util').wrappedResponse,
		crypto = require('./../util').crypto,
		serverConfig = require('config').get('server');
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
		return wrappedResponse({ res : res,
									  				 code : 400,
						  							 message : 'invalid username or password',
						  							 data : 'InvalidCredentials' });
	}
	//async parallel init...
	async.parallel({
		//encrypt password
		password : function(callback) {
			crypto.createSalt(32 , function(err , salt) {
				if (err) return callback(err , null); 
				callback(null , { salt : salt,
						   		  			hash : crypto.createHash(user.password , salt , 'sha512') });

			});
		},
		//create token
		token : function(callback) {
			crypto.createSalt(32 , function(err , salt) {
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
		if (err) return next(err);
		//save user
		user.token = results.token;
		user.password = results.password;
		var newUser = UserModel(user);
		newUser.save(function(err , doc) {
			if (err) return next(err);
			var body = {
				id : doc._id,
				token : doc.token.hash
			};
			//user inserted, respond with token...
			res.set('Location' , serverConfig.name + '/users/' + doc._id);
			return wrappedResponse({ res : res,
											  			 code : 201,
							  							 data : body,
							  							 message : '' });
		});
	});
});
//Read all users
router.get('/' , function(req , res , next) {
	'use strict';
	UserModel.find({} , function(err , users) {
		if (err) return next(err);
		return wrappedResponse({ res : res,
														 code : 200,
														 data : users,
														 message : '' });
	});
});
//Read user by id
router.get('/:id' , function(req , res , next) {
	'use strict';
	
});
//eporting router object
module.exports = router;
