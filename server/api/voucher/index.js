'use strict';

var express = require('express');
var controller = require('./voucher.controller');

var router = express.Router();

//for user voucher table
//router.get('/users', controller.findAllUserVoucher);
//router.post('/users/', controller.addUserVoucher);
//router.delete('/users/:id', controller.deleteUserVoucher);

//for voucher type table
//router.get('/types', controller.getTypes);
//router.get('/types/:id', controller.getType);
//router.post('/types/', controller.addType);
//router.delete('/type/:id', controller.deleteType);

//for voucher attribute table
//router.get('/attributes', controller.findAllAttribute);
//router.post('/attributes', controller.addAttribute);
//router.delete('/attributes/:id', controller.deleteAttribute);

//for voucher permit table
//router.get('/permit', controller.findAllPermit);
//router.post('/permit', controller.addPermit);
//router.delete('/permit/:id', controller.deletePermit);

//for voucher timeslot table
//router.get('/timeslot', controller.findAllTimeslot);
//router.post('/timeslot', controller.addTimeslot);
//router.delete('/timeslot/:id', controller.deleteTimeslot);

//default function for voucher table
router.get('/', controller.index);
//router.get('/types', controller.getTypes);
router.get('/:id', controller.show);
//router.post('/types', controller.addType);
router.post('/', controller.create);
router.post('/bulk', controller.bulkCreate);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
