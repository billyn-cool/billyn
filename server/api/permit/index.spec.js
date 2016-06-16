'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var permitCtrlStub = {
  index: 'permitCtrl.index',
  show: 'permitCtrl.show',
  create: 'permitCtrl.create',
  update: 'permitCtrl.update',
  destroy: 'permitCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var permitIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './permit.controller': permitCtrlStub
});

describe('Permit API Router:', function() {

  it('should return an express router instance', function() {
    permitIndex.should.equal(routerStub);
  });

  describe('GET /api/permits', function() {

    it('should route to permit.controller.index', function() {
      routerStub.get
        .withArgs('/', 'permitCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/permits/:id', function() {

    it('should route to permit.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'permitCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/permits', function() {

    it('should route to permit.controller.create', function() {
      routerStub.post
        .withArgs('/', 'permitCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/permits/:id', function() {

    it('should route to permit.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'permitCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/permits/:id', function() {

    it('should route to permit.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'permitCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/permits/:id', function() {

    it('should route to permit.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'permitCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
