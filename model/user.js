(function(){
		
	'use strict';

	var mongoose = require('mongoose'),
			assert = require('assert'),
			Schema = mongoose.Schema,
			txtOnly = /^(?:[a-zA-Z])+$/;


	//Schema design
	var userSchema = new Schema({
		first : String,
		last : String,
		email : { type : String , unique : true },
		password : {
			salt : { type : String , required : true },
			hash : { type : String , required : true }
		},
		token : {
			salt : { type : String , required : true },
			hash : { type : String , required : true }
		}
	});

	//custom validation
	// @first only text
	userSchema
		.path('first')
		.validate(function(value) {
			try {
				assert.strictEqual(typeof value , 'string');
				assert.ok(txtOnly.test(value));
			}
			catch (e) {
				return false;
			}
			return true;
		} , 'first is invalid');

	// @last only text
	userSchema
		.path('last')
		.validate(function (value) {
			try {
				assert.strictEqual(typeof value , 'string');
				assert.ok(txtOnly.test(value));
			}
			catch (e) {
				return false;
			}
			return true;
		} , 'last is invalid');


	module.exports = mongoose.model('User' , userSchema);
})();
