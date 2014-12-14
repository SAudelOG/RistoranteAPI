var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

module.exports = mongoose.model('User' , userSchema);

