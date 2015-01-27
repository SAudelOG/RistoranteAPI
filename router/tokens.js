'use strict';

var express = require('express'),
		router = express.Router(),
		UserModel = require('./../model/user');

//create new tokens
router.post('/' , function(req , res) {
	var body = req.body;
	if (body.email && body.password) {
		
	}
	else {
		return wrappedResponse({ res : res,
														 code : 400,
														 data : 'InvalidBody',
														 message : 'email and password required' });
	}
});

module.exports = router;

