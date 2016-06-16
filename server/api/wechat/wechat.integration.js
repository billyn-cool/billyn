'use strict';

var app = require('../..');
import request from 'supertest';

var newWechat;

describe('Wechat API:', function() {

  describe('GET /api/wechats', function() {
    var wechats;

    beforeEach(function(done) {
      request(app)
        .get('/api/wechats')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          wechats = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      wechats.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/wechats', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/wechats')
        .send({
          name: 'New Wechat',
          info: 'This is the brand new wechat!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newWechat = res.body;
          done();
        });
    });

    it('should respond with the newly created wechat', function() {
      newWechat.name.should.equal('New Wechat');
      newWechat.info.should.equal('This is the brand new wechat!!!');
    });

  });

  describe('GET /api/wechats/:id', function() {
    var wechat;

    beforeEach(function(done) {
      request(app)
        .get('/api/wechats/' + newWechat._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          wechat = res.body;
          done();
        });
    });

    afterEach(function() {
      wechat = {};
    });

    it('should respond with the requested wechat', function() {
      wechat.name.should.equal('New Wechat');
      wechat.info.should.equal('This is the brand new wechat!!!');
    });

  });

  describe('PUT /api/wechats/:id', function() {
    var updatedWechat;

    beforeEach(function(done) {
      request(app)
        .put('/api/wechats/' + newWechat._id)
        .send({
          name: 'Updated Wechat',
          info: 'This is the updated wechat!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedWechat = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedWechat = {};
    });

    it('should respond with the updated wechat', function() {
      updatedWechat.name.should.equal('Updated Wechat');
      updatedWechat.info.should.equal('This is the updated wechat!!!');
    });

  });

  describe('DELETE /api/wechats/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/wechats/' + newWechat._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when wechat does not exist', function(done) {
      request(app)
        .delete('/api/wechats/' + newWechat._id)
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
