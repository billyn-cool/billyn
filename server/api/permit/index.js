'use strict';

var express = require('express');
var controller = require('./permit.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/roles', controller.findAllPermitRole);
router.get('/roles/user', controller.findAllUserPermitRole);
router.get('/roles/:id', controller.findPermitRole);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/findOrCreate', controller.findOrCreate);
router.post('/roles', controller.createPermitRole);
router.post('/roles/bulk', controller.addBulkPermitRole);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/roles/:id', controller.destroyPermitRole);
router.delete('/:id', controller.destroy);

module.exports = router;
