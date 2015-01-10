var app = require('./../app'),
		request = require('supertest'),
		should = require('should'),
		MongoClient = require('mongodb').MongoClient,
		async = require('async');

function cleanDb (collection , cb) {
	'use strict';
	collection.drop(function(err) {
		cb(err);
	});
};

MongoClient.connect('mongodb://localhost:27017/playing' , function(err , db) {
	'use strict';
	var users = db.collection('users');
	if (err) throw err;
	describe('Users Unit Test' , function() {
		describe('#Create users /users POST' , function() {
			beforeEach('Dropping users collection' , function(done) {
				cleanDb(users , done);
			});
			it('Should create a new user' , function(done) {
				var newUser = {
					email : 'email@email.com',
					password : 'password'
				};
				request(app) 
					.post('/users')
					.send(newUser)
					.expect('Content-Type', /json/) 
					.expect('Location', /http:\/\/localhost:3000\/users\/([a-b0-9A-B]+)/)
					.expect(201)
					.end(function(err , res) { 
						should(err).not.be.ok;
						var body = res.body;
						var data = body.data;
						body.status.should.be.type('string');
						body.status.should.equal('success');
						body.code.should.be.type('number');
						body.code.should.equal(201);
						body.message.should.be.type('string');
						should(body.message).not.be.ok;
						data.should.be.type('object');
						data.token.should.be.type('string');
						data.token.should.not.be.empty;
						data.id.should.be.type('string');
						data.id.should.be.not.be.empty;
						done();
					});
			});
			it('Should throw InvalidCredentials error when parameters are not valid' , function(done) {
				var newUser = {
					email : 'asd123',
					password : '12345'
				};
				request(app)
					.post('/users')
					.send(newUser)
					.expect('Content-Type' , /json/)
					.expect(400)
					.end(function(err , res) {
						var body = res.body;
						var data = body.data;
						should(err).not.be.ok;
						body.status.should.be.type('string');
						body.status.should.equal('error');
						body.code.should.be.type('number');
						body.code.should.equal(400);
						body.message.should.be.type('string');
						body.message.should.equal('invalid username or password');
						data.should.be.type('string');
						data.should.be.equal('InvalidCredentials');
						done();
					});
			});
		});
		describe('#Read users /users GET' , function() {
			beforeEach('Create 10 new users' , function(done) {
				cleanDb(users , function(err) {
					if (err) return done(err);
					var users = [],
							i = 0;
					for (i ; i < 10 ; i += 1) {
						users.push({ email : 'email' + i + '@gmail.com',
											 	 password : 'password' });
					}
					async.each(users , function(user , callback) {
						request(app)
							.post('/users')
							.send(user)
							.end(function(err , res) {
								if (err) return callback(err);
								var body = res.body;
								callback();
							});
					},
					function(err) {
						if (err) throw err;
						done();	
					});
				});
			});
			it('Should return 10 users' , function(done) {
				request(app)
					.get('/users')
					.expect('Content-Type' , /json/)
					.expect(200)
					.end(function(err , res) {
						var body  = res.body;
						should(err).not.be.ok;
						body.status.should.be.type('string');
						body.status.should.equal('success');
						body.code.should.be.type('number');
						body.code.should.equal(200);
						body.message.should.be.type('string');
						body.message.should.be.empty;
						body.data.should.be.an.Array;
						body.data.should.have.length(10)
						done();
					});
			});
		});
	});
});
