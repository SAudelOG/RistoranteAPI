var app = require('./../app'),
		should = require('should'),
		request = require('supertest'),
		http = require('http');

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
	describe('#404 Response' , function() {
		it('Should return 404' , function(done) {
			request(app)
				.get('/invalid')
				.expect(404)
				.expect('Content-Type' , /json/)
				.end(function(err , res) {
					var body = res.body;
					should(err).not.be.ok;
					body.code.should.equal(404);
					body.status.should.equal('error');
					done();
				});
		});
	});
	describe('#500 Error' , function() {
		it('Should return 500' , function(done) {
			request(app)
				.get('/fail')
				.expect(500)
				.expect('Content-Type' , /json/)
				.end(function(err , res) {
					var body = res.body;
					should(err).not.be.ok;
					body.code.should.equal(500);
					body.status.should.equal('fail');
					done();
				});
		});
	});
	/*describe('#CORS enabled' , function() {
		it('Should CORS be working' , function(done) {
			request(app)
				.options('/')
				.set('Origin' , 'http://localhost')
				.end(function(err , res) {
					console.log(res);
				});
				
		});
		it('Should CORS reject requests' , function(done) {
			request(app)
				.get('/')
				.set('Origin' , 'http://www.example.com')
				.end(function(err , res) {
					console.log(res);
				});
		});
	});	*/
});
