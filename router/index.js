var usersRouter = require('./users.js'),
		wrappedResponse = require('./../util').wrappedResponse,
		cors = require('./../util').cors,
		config = require('./../config'),
		clientConfig;

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
	clientConfig = config.development.client;
}
if (process.env.NODE_ENV === 'production') {
	clientConfig = config.production.client;
}

module.exports = function(app) {
	//angular CORS
	app.use(cors({ origin : clientConfig.origin,
								 methods : clientConfig.methods,
								 headers : clientConfig.headers }));
	app.get('/', function(req , res) {
		res.json({ message : 'Hello!' });
	});
	//Api functionality
	app.use('/users' , usersRouter);
	//Testing 500 handler
	app.get('/fail' , function(req , res) {
		next(new Error('testing error'));
	});
	//404 responses handler
	app.use(function(req , res , next) {
		wrappedResponse({ res : res,
											code : 404,
											message : 'Request not found',
											data : 'Request not found'});
		next();
	});
	//500 responses handler
	app.use(function(err , req , res , next) {
		wrappedResponse({ res : res,
						 	 				code : 500,
						  				message : 'Unable to process request, reach out to the administraror',
						  				data : err });
		next();
	});
};
