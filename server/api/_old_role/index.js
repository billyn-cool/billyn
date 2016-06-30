'use strict';

var express = require('express');
var controller = require('./category.controller');

var router = express.Router();

//get all roles under some space, 
//router.get('/', controller.index);
//get role by id
router.get('/:id', controller.getRole);
//add child role
router.post('/:id', controller.addChild);
//get role by name
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.get('/bn/:name', controller.getRole);
//get all roles in space
router.get('/:spaceId/space', controller.getSpaceRoles);
//get user roles in space
router.get('/:spaceId/me', controller.getUserRoles);
//add space role
router.post('/space/:spaceId', controller.addRole);


module.exports = router;
