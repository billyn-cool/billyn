'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var spaceCtrlStub = {
  index: 'spaceCtrl.index',
  show: 'spaceCtrl.show',
  create: 'spaceCtrl.create',
  update: 'spaceCtrl.update',
  destroy: 'spaceCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var spaceIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './space.controller': spaceCtrlStub
});

describe('Space API Router:', function() {

  it('should return an express router instance', function() {
    spaceIndex.should.equal(routerStub);
  });

  describe('GET /api/spaces', function() {

    it('should route to space.controller.index', function() {
      routerStub.get
        .withArgs('/', 'spaceCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/spaces/:id', function() {

    it('should route to space.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'spaceCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/spaces', function() {

    it('should route to space.controller.create', function() {
      routerStub.post
        .withArgs('/', 'spaceCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/spaces/:id', function() {

    it('should route to space.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'spaceCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/spaces/:id', function() {

    it('should route to space.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'spaceCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/spaces/:id', function() {

    it('should route to space.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'spaceCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
