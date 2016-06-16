'use strict';

var express = require('express');
var controller = require('./attribute.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

router.post('/addAttribute/', controller.addAttribute);
router.post('/addAttributes/', controller.addAttributes);

router.post('/getAttribute/', controller.getAttribute);
//router.post('/getAttributes/', controller.getAttributes);


module.exports = router;
