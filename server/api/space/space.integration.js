'use strict';

var app = require('../..');
import request from 'supertest';

var newSpace;

describe('Space API:', function() {

  describe('GET /api/spaces', function() {
    var spaces;

    beforeEach(function(done) {
      request(app)
        .get('/api/spaces')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          spaces = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      spaces.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/spaces', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/spaces')
        .send({
          name: 'New Space',
          info: 'This is the brand new space!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newSpace = res.body;
          done();
        });
    });

    it('should respond with the newly created space', function() {
      newSpace.name.should.equal('New Space');
      newSpace.info.should.equal('This is the brand new space!!!');
    });

  });

  describe('GET /api/spaces/:id', function() {
    var space;

    beforeEach(function(done) {
      request(app)
        .get('/api/spaces/' + newSpace._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          space = res.body;
          done();
        });
    });

    afterEach(function() {
      space = {};
    });

    it('should respond with the requested space', function() {
      space.name.should.equal('New Space');
      space.info.should.equal('This is the brand new space!!!');
    });

  });

  describe('PUT /api/spaces/:id', function() {
    var updatedSpace;

    beforeEach(function(done) {
      request(app)
        .put('/api/spaces/' + newSpace._id)
        .send({
          name: 'Updated Space',
          info: 'This is the updated space!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedSpace = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedSpace = {};
    });

    it('should respond with the updated space', function() {
      updatedSpace.name.should.equal('Updated Space');
      updatedSpace.info.should.equal('This is the updated space!!!');
    });

  });

  describe('DELETE /api/spaces/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/spaces/' + newSpace._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when space does not exist', function(done) {
      request(app)
        .delete('/api/spaces/' + newSpace._id)
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
