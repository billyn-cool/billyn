'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var roleCtrlStub = {
  index: 'roleCtrl.index',
  show: 'roleCtrl.show',
  create: 'roleCtrl.create',
  update: 'roleCtrl.update',
  destroy: 'roleCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var roleIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './role.controller': roleCtrlStub
});

describe('Role API Router:', function() {

  it('should return an express router instance', function() {
    roleIndex.should.equal(routerStub);
  });

  describe('GET /api/roles', function() {

    it('should route to role.controller.index', function() {
      routerStub.get
        .withArgs('/', 'roleCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/roles/:id', function() {

    it('should route to role.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'roleCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/roles', function() {

    it('should route to role.controller.create', function() {
      routerStub.post
        .withArgs('/', 'roleCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/roles/:id', function() {

    it('should route to role.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'roleCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/roles/:id', function() {

    it('should route to role.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'roleCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/roles/:id', function() {

    it('should route to role.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'roleCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
