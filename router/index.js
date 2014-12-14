var usersRouter = require('./users.js');
var wrappedResponse = require('./../util').wrappedResponse;

module.exports = function(app) {
	app.get('/', function(req , res) {
		res.json({ message : 'OK' });
	});
	app.use('/users' , usersRouter);
	//500 responses handler
	app.use(function(err , req , res , next) {
		wrappedResponse({ res : res,
						  code : 500,
						  message : 'Unable to process request, reach out to the administraror',
						  data : err });
	});
};
