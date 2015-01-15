'use strict';

var express = require('express'),
		assert = require('assert'),
		async = require('async'),
		jwt = require('jwt-simple'),
		router = express.Router(),
		UserModel = require('./../model/user'),
		wrappedResponse = require('./../util').wrappedResponse,
		crypto = require('./../util').crypto,
		config = require('./../config'),
		serverConfig;

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
	serverConfig = config.development.server;
}
if (process.env.NODE_ENV === 'production') {
	serverConfig = config.production.server;
}
//Create user
router.post('/', function(req , res , next) {
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
		var newUser = new UserModel(user);
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
	var id = req.params.id;
	UserModel.findById(id , function(err , user) {
		var newUser,
				selectedFields = ['first' , 'last' , 'email'];
		if (!err && user) {
			newUser = { id : user._id };
			selectedFields.forEach(function(field) {
				if (user[field]) {
					newUser[field] = user[field];
				}
			});
			return wrappedResponse({ res : res,
															 code : 200,
															 data : newUser,
															 message : '' });
		}
		else {
			if (err.type !== 'ObjectId') return next(err); 
			if (!user || err.type === 'ObjectId') return wrappedResponse({ res : res,
																			 															 code : 404,
															 																			 data : 'InvalidParameter',
															 																			 message : 'id invalid or not found' });
		}
	});
});
//Update user by id
router.put('/:id' , function(req , res , next) {
	var id = req.params.id,
			body = req.body;
	UserModel.findById(id , function(err , user) {
		if (!err && user) {
					
		}
		else {
			if (err.type !== 'ObjectId') return next(err); 
			if (!user || err.type === 'ObjectId') return wrappedResponse({ res : res,
																			 															 code : 404,
															 																			 data : 'InvalidParameter',
															 																			 message : 'id invalid or not found' });
		}
	}); 	
});
//Delete user by id
router.delete('/:id' , function(req , res , next) {
	var id = req.params.id;
	UserModel.findByIdAndRemove(id , function(err , user) {
		var newUser,
				selectedFields = ['first' , 'last' , 'email'];
		if (!err && user) {
			newUser = { id : user._id };
			selectedFields.forEach(function(field) {
				if (user[field]) {
					newUser[field] = user[field];
				}
			});
			return wrappedResponse({ res : res,
															 code : 200,
															 data : newUser,
															 message : '' });
		}
		else {
			if (err.type !== 'ObjectId') return next(err); 
			if (!user || err.type === 'ObjectId') return wrappedResponse({ res : res,
																			 															 code : 404,
															 																			 data : 'InvalidParameter',
															 																			 message : 'id invalid or not found' });
		}
	
	});
});
//exporting router object
module.exports = router;
