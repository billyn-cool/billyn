'use strict';

var express = require('express');
var controller = require('./app.controller');

var router = express.Router();

/**
 * Provides the base sever side restful api under app module
 * 
 * Using Rails-like standard naming convention for endpoints.
 * 
 * GET     /api/apps              ->  index
 * POST    /api/apps              ->  create
 * POST    /api/apps/bulk         ->  bulk create apps
 * GET     /api/apps/:id          ->  get app by id
 * PUT     /api/apps/:id          ->  update
 * DELETE  /api/apps/:id          ->  destroy
 * 
 * @module server/api/app
 */

router.get('/', controller.index);
//router.get('/byname', controller.show);
router.get('/:id', controller.show);
//router.get('/byname/:name', controller.getAppByName);
router.post('/bulk', controller.bulkCreate);
//router.post('/joinSpace', controller.joinSpace);
router.post('/', controller.create);
//router.post('/app', controller.createApp);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
