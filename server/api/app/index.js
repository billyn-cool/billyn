'use strict';

var express = require('express');
var controller = require('./app.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/byname', controller.show);
router.get('/:id', controller.show);
//router.get('/byname/:name', controller.getAppByName);
router.post('/bulk', controller.bulkCreate);
router.post('/', controller.create);
//router.post('/app', controller.createApp);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.post('/joinSpace', controller.joinSpace);

module.exports = router;
