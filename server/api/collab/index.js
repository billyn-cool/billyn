'use strict';

var express = require('express');
var controller = require('./collab.controller');

var router = express.Router();

router.get('/spaces/joinable', controller.findAllJoinableSpace);
router.get('/spaces/joined', controller.findAllJoinedSpace);
router.get('/user/nut/permits', controller.findAllUserNutPermitByCollab);
router.get('/user/nuts', controller.findAllUserNutPermit);
//router.get('/roles/child', controller.findAllChildRole);
router.get('/roles/parent', controller.findAllParentRole);
router.get('/:id', controller.show);
router.get('/', controller.index);
router.post('/bulk', controller.bulkCreate);
router.post('/roles', controller.addCollabRole);
router.post('/roles/bulk', controller.bulkAddCollabRole);
router.post('/', controller.create);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

//working on collab role table
//router.get('/roles', controller.findAllCollabRole);
//router.get('/roles/:id', controller.findCollabRole);
//router.post('/roles', controller.addCollabRole);
//router.put('/roles/:id', controller.updateCollabRole);
//router.delete('/roles/:id', controller.destroyCollabRole);

module.exports = router;
