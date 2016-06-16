'use strict';

var express = require('express');
var controller = require('./role.controller');

var router = express.Router();

//get space roles format: /roles?spaceId=xxxx
//get user roles format: /roles?userId=xxxx
//get user roles in space format: /roles?userId=xxxx&spaceId=xxxx
router.get('/', controller.index);

//get role by name: /roles/name?spaceId=xxx&role=xxx[or name=xxx]
router.get('/name', controller.getRole);
router.get('/user/space', controller.findAllUserSpaceRole);

//get role by Id: id = number
router.get('/:id', controller.getRole);

//get role children, url format: /roles/:id/children?mode=leaf[child,all]
router.get('/:id/children', controller.getChildren);

//add user role: post data format: {userId: xxx, roleId: xxxx [role: xxx]}
router.post('/user', controller.addUserRole);

//add batch user role: post data format: [{userId: xxx, roleId: xxxx [role: xxx]},...]
router.post('/users/batch', controller.batchAddUserRole);

//add roles, post format: [{name:xxx,spaceId:xxxx},....]
router.post('/batch', controller.batchAdd);

//add grants
router.post('/grants', controller.addGrants);

//add child role, findOrCreate
router.post('/:id', controller.addChild);

//post data format: {spaceId=xxx,name=xxx}
router.post('/', controller.create);

router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
