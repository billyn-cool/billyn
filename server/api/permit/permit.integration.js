'use strict';

var app = require('../..');
import request from 'supertest';

var newPermit;

describe('Permit API:', function() {

  describe('GET /api/permits', function() {
    var permits;

    beforeEach(function(done) {
      request(app)
        .get('/api/permits')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          permits = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      permits.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/permits', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/permits')
        .send({
          name: 'New Permit',
          info: 'This is the brand new permit!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newPermit = res.body;
          done();
        });
    });

    it('should respond with the newly created permit', function() {
      newPermit.name.should.equal('New Permit');
      newPermit.info.should.equal('This is the brand new permit!!!');
    });

  });

  describe('GET /api/permits/:id', function() {
    var permit;

    beforeEach(function(done) {
      request(app)
        .get('/api/permits/' + newPermit._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          permit = res.body;
          done();
        });
    });

    afterEach(function() {
      permit = {};
    });

    it('should respond with the requested permit', function() {
      permit.name.should.equal('New Permit');
      permit.info.should.equal('This is the brand new permit!!!');
    });

  });

  describe('PUT /api/permits/:id', function() {
    var updatedPermit;

    beforeEach(function(done) {
      request(app)
        .put('/api/permits/' + newPermit._id)
        .send({
          name: 'Updated Permit',
          info: 'This is the updated permit!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedPermit = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPermit = {};
    });

    it('should respond with the updated permit', function() {
      updatedPermit.name.should.equal('Updated Permit');
      updatedPermit.info.should.equal('This is the updated permit!!!');
    });

  });

  describe('DELETE /api/permits/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/permits/' + newPermit._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when permit does not exist', function(done) {
      request(app)
        .delete('/api/permits/' + newPermit._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
