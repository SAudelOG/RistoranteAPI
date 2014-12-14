var app = require('./../app');
var should = require('should');
var request = require('supertest');

describe('Server test', function() {
	describe('#Testing server', function() {
		it('Should return 200 OK', function(done) {
			request(app)
				.get('/')
				.expect(200)
				.expect('Content-Type', /json/)
				.end(function(err , res) {
					'use strict';
					var body = res.body;
					should(err).not.be.ok;
					body.message.should.equal('OK');
					done();
				});
		});
	});
});
