'use strict';

var app = require('../..');
import request from 'supertest';

var newAttribute;

describe('Attribute API:', function() {

  describe('GET /api/attributes', function() {
    var attributes;

    beforeEach(function(done) {
      request(app)
        .get('/api/attributes')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          attributes = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      attributes.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/attributes', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/attributes')
        .send({
          name: 'New Attribute',
          info: 'This is the brand new attribute!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newAttribute = res.body;
          done();
        });
    });

    it('should respond with the newly created attribute', function() {
      newAttribute.name.should.equal('New Attribute');
      newAttribute.info.should.equal('This is the brand new attribute!!!');
    });

  });

  describe('GET /api/attributes/:id', function() {
    var attribute;

    beforeEach(function(done) {
      request(app)
        .get('/api/attributes/' + newAttribute._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          attribute = res.body;
          done();
        });
    });

    afterEach(function() {
      attribute = {};
    });

    it('should respond with the requested attribute', function() {
      attribute.name.should.equal('New Attribute');
      attribute.info.should.equal('This is the brand new attribute!!!');
    });

  });

  describe('PUT /api/attributes/:id', function() {
    var updatedAttribute;

    beforeEach(function(done) {
      request(app)
        .put('/api/attributes/' + newAttribute._id)
        .send({
          name: 'Updated Attribute',
          info: 'This is the updated attribute!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedAttribute = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedAttribute = {};
    });

    it('should respond with the updated attribute', function() {
      updatedAttribute.name.should.equal('Updated Attribute');
      updatedAttribute.info.should.equal('This is the updated attribute!!!');
    });

  });

  describe('DELETE /api/attributes/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/attributes/' + newAttribute._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when attribute does not exist', function(done) {
      request(app)
        .delete('/api/attributes/' + newAttribute._id)
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
