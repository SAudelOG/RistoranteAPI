var app = require('./../app');
var request = require('supertest');
var should = require('should');
var MongoClient = require('mongodb').MongoClient;

describe('Users Unit Test' , function() {
	describe('#Create users /users POST' , function() {
		beforeEach('Dropping users collection' , function(done) {
			'use strict';
			MongoClient.connect('mongodb://localhost:27017/playing' , function(err , db) {
				should(err).not.be.ok;
				db.collectionNames('users' , function(err , items) {
					'use strict';
					if (items.length === 1 ) {
						db.collection('users').drop(function(err) {
							should(err).not.be.ok;
							done();
						});
					}
					else {
						done();
					}
				});
			});
		});
		it('Should create a new user' , function(done) {
			'use strict';
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
					'use strict';
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
			'use strict';
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
					'use strict';
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
});
