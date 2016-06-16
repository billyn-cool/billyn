'use strict';

var express = require('express');
var controller = require('./voucher.controller');

var router = express.Router();

//default function for voucher table
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.destroy);

//for user voucher table
router.get('/vuser', controller.findAllUserVoucher);
router.get('/:id/vuser', controller.findUserVoucher);
router.post('/vuser/', controller.createUserVoucher);
router.put('/:id/vuser', controller.updateUserVoucher);
router.delete('/:id/vuser', controller.deleteUserVoucher);

module.exports = router;
