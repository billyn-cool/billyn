'use strict';

var app = require('../..');
import request from 'supertest';

var newRole;

describe('Role API:', function() {

  describe('GET /api/roles', function() {
    var roles;

    beforeEach(function(done) {
      request(app)
        .get('/api/roles')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          roles = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      roles.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/roles', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/roles')
        .send({
          name: 'New Role',
          info: 'This is the brand new role!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newRole = res.body;
          done();
        });
    });

    it('should respond with the newly created role', function() {
      newRole.name.should.equal('New Role');
      newRole.info.should.equal('This is the brand new role!!!');
    });

  });

  describe('GET /api/roles/:id', function() {
    var role;

    beforeEach(function(done) {
      request(app)
        .get('/api/roles/' + newRole._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          role = res.body;
          done();
        });
    });

    afterEach(function() {
      role = {};
    });

    it('should respond with the requested role', function() {
      role.name.should.equal('New Role');
      role.info.should.equal('This is the brand new role!!!');
    });

  });

  describe('PUT /api/roles/:id', function() {
    var updatedRole;

    beforeEach(function(done) {
      request(app)
        .put('/api/roles/' + newRole._id)
        .send({
          name: 'Updated Role',
          info: 'This is the updated role!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedRole = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedRole = {};
    });

    it('should respond with the updated role', function() {
      updatedRole.name.should.equal('Updated Role');
      updatedRole.info.should.equal('This is the updated role!!!');
    });

  });

  describe('DELETE /api/roles/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/roles/' + newRole._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when role does not exist', function(done) {
      request(app)
        .delete('/api/roles/' + newRole._id)
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
