var app = require('./../app');
var request = require('supertest');
var should = require('should');
var MongoClient = require('mongodb').MongoClient;

describe('Users Unit Test', function() {
	describe('#Create users /users POST', function() {
		before('dropping users collection' , function(done) {
			'use strict';
			MongoClient.connect('mongodb://localhost:27017/playing' , function(err , db) {
				should(err).not.be.ok;
				var users = db.collection('users');
				users.drop(function(err) {
					should(err).not.be.ok;
					done();
				});
			});
		});
		it('Should create a new user', function(done) {
			'use strict';
			var newUser = {
				first : 'Luis',
				last : 'Valdovinos',
				email : 'lastkiss115@gmail.com',
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
					data.token.should.be.type('string');
					data.token.should.not.be.empty;
					data.id.should.be.type('string');
					data.id.should.be.not.be.empty;
					done();
				});
		});
	});
});
