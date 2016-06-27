'use strict';

var express = require('express');
var controller = require('./circle.controller');

var router = express.Router();

//working on collabs role table
/*
router.get('/collabs', controller.findCollabs);
router.get('/collabs/user', controller.findUserCollabs);
router.get('/collabs/nuts/user', controller.findUserCollabNuts);
router.get('/collabs/:id', controller.findCollab);
router.post('/collabs/circle', controller.addCircleCollab);
router.post('/collabs/role', controller.addCollabRole);
router.post('/collabs', controller.addCollab);
router.patch('/collabs/:id', controller.updateCollab);
router.delete('/collabs/:id', controller.destroyCollab);
*/

router.get('/user', controller.findUserCircles);
router.get('/joinable', controller.findCirclesForJoin);
router.get('/joined', controller.findJoinedCircles);
router.get('/spaces/manage', controller.findCircleSpacesForManage);
router.get('/:id', controller.show);
router.get('/', controller.index);
//router.get('/nuts/user', controller.findUserCircleNuts);
//router.post('/space', controller.addCircleSpace);
router.post('/joinCircle', controller.joinCircle);
router.post('/', controller.create);
router.post('/types', controller.addType);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
