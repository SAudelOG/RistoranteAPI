'use strict';

var request = require('supertest'),
		should = require('should'),
		MongoClient = require('mongodb').MongoClient,
		async = require('async'),
		app = require('./../app'),
		config = require('./../config'),
		users,
		dbConfig;

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
	dbConfig = config.development.database;
}
if (process.env.NODE_ENV === 'production') {
	dbConfig = config.production.database;
}

function cleanDb (cb) {
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

describe('Security\/Tokens Unit Test' , function() {
	before('Create DB Connection' , function(done) {
		MongoClient.connect(dbConfig.conStr , function(err , db) {
			if (err) return done(err);
			users = db.collection('users');
			done();
		});
	});
	describe('#Create tokens /security/tokens POST' , function() {
		beforeEach('Dropping users collection' , function(done) {
			cleanDb(done);
		});
		it('Should return 201' , function(done) {
			var nUser = {
				email : 'example@gmail.com',
				password : 'example'
			};
			//create new user...
			request(app)
				.post('/users')
				.send(nUser)
				.expect(201)
				.expect('Content-Type' , /json/)
				.end(function(err , res) {
					var body = res.body;
					body.data.token.should.be.a.String;
					body.data.token.should.not.be.empty;
					should(err).not.be.ok;
					//new user's created, let's test his access..	
					request(app)
						.post('/security/tokens')
						.send(nUser)
						.expect(201)
						.expect('Content-Type' , /json/)
						.end(function(err , res) {
							var body = res.body;
							should(err).not.be.ok;
							body.status.should.be.a.String;
							body.status.should.equal('success');
							body.code.should.be.a.Number;
							body.code.should.equal(201);
							body.message.should.be.a.String;
							body.message.should.be.empty;
							body.data.token.should.be.String;
							body.data.token.should.not.be.empty;
							done();	
						});
				});
		});
	});
});
