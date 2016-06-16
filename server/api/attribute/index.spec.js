'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var attributeCtrlStub = {
  index: 'attributeCtrl.index',
  show: 'attributeCtrl.show',
  create: 'attributeCtrl.create',
  update: 'attributeCtrl.update',
  destroy: 'attributeCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var attributeIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './attribute.controller': attributeCtrlStub
});

describe('Attribute API Router:', function() {

  it('should return an express router instance', function() {
    attributeIndex.should.equal(routerStub);
  });

  describe('GET /api/attributes', function() {

    it('should route to attribute.controller.index', function() {
      routerStub.get
        .withArgs('/', 'attributeCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/attributes/:id', function() {

    it('should route to attribute.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'attributeCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/attributes', function() {

    it('should route to attribute.controller.create', function() {
      routerStub.post
        .withArgs('/', 'attributeCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/attributes/:id', function() {

    it('should route to attribute.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'attributeCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/attributes/:id', function() {

    it('should route to attribute.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'attributeCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/attributes/:id', function() {

    it('should route to attribute.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'attributeCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
