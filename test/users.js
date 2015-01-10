var app = require('./../app'),
		request = require('supertest'),
		should = require('should'),
		MongoClient = require('mongodb').MongoClient,
		async = require('async'),
		dbConfig = require('config').get('database'),
		users;

function cleanDb (cb) {
	'use strict';
	users.drop(function(err) {
		if (!err) return cb(null);
		if (err.errmsg !== 'ns not found') return cb(err);
		if (err.errmsg === 'ns not found') {
			return cb(null);
		}
		else {
			cb(null);
		}
	});
};
describe('Users Unit Test' , function() {
	'use strict';
	before('Create DB connection' , function(done) {
		MongoClient.connect(dbConfig.conStr , function(err , db) {
			if (err) throw err;
			console.log('Database connection done');
				users = db.collection('users');
				done();
		});
	});
	after('After method' , function(done) {
		console.log('After method');
		done();
	});
	describe('#Create users /users POST' , function() {
		beforeEach('Dropping users collection' , function(done) {
			cleanDb(done);
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
			cleanDb(function(err) {
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
	describe('#Read by ID /users/:id' , function() {
		it('Should read the information of a user by id' , function(done) {
			var newUser = {
				email : 'asd123@gmail.com',
				password : '12345'
			};
			request(app)
				.post('/users')
				.send(newUser)
				.end(function(err , res) {
					var userId = res.body.data.id;
					if (err) return done(err);
					request(app)
						.get('/users' + userId)
						.expect('Content-Type' , /json/)
						.expect(200)
						.end(function(err , res) {
							var body = res.body;
							should(err).not.be.ok;
							body.status.should.be.type('string');
							body.status.should.equal('success');
							body.code.should.be.type('number');
							body.code.should.equal(200);
							body.message.should.be.type('string');
							body.message.should.be.empty;
							body.data.should.be.an.Object;
							body.data.should.have.property('id');
							body.data.should.have.property('email');
							body.data.should.have.property('first');
							body.data.should.have.property('last');
							done();		
						});
				});
		});
	});
});
