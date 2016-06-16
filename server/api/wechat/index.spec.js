'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var wechatCtrlStub = {
  index: 'wechatCtrl.index',
  show: 'wechatCtrl.show',
  create: 'wechatCtrl.create',
  update: 'wechatCtrl.update',
  destroy: 'wechatCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var wechatIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './wechat.controller': wechatCtrlStub
});

describe('Wechat API Router:', function() {

  it('should return an express router instance', function() {
    wechatIndex.should.equal(routerStub);
  });

  describe('GET /api/wechats', function() {

    it('should route to wechat.controller.index', function() {
      routerStub.get
        .withArgs('/', 'wechatCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/wechats/:id', function() {

    it('should route to wechat.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'wechatCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/wechats', function() {

    it('should route to wechat.controller.create', function() {
      routerStub.post
        .withArgs('/', 'wechatCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/wechats/:id', function() {

    it('should route to wechat.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'wechatCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/wechats/:id', function() {

    it('should route to wechat.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'wechatCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/wechats/:id', function() {

    it('should route to wechat.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'wechatCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
