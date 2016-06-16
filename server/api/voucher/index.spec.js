'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var appCtrlStub = {
  index: 'appCtrl.index',
  show: 'appCtrl.show',
  create: 'appCtrl.create',
  update: 'appCtrl.update',
  destroy: 'appCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var appIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './app.controller': appCtrlStub
});

describe('App API Router:', function() {

  it('should return an express router instance', function() {
    appIndex.should.equal(routerStub);
  });

  describe('GET /api/apps', function() {

    it('should route to app.controller.index', function() {
      routerStub.get
        .withArgs('/', 'appCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/apps/:id', function() {

    it('should route to app.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'appCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/apps', function() {

    it('should route to app.controller.create', function() {
      routerStub.post
        .withArgs('/', 'appCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/apps/:id', function() {

    it('should route to app.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'appCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/apps/:id', function() {

    it('should route to app.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'appCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/apps/:id', function() {

    it('should route to app.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'appCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
