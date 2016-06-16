'use strict';

import {Router} from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

//impossible to get all users
//router.get('/', auth.isAuthenticated(), controller.index);
//get all users under space, todo: need check whether user is admin of space before get users under space
router.get('/sp/:spaceId', auth.isAuthenticated(), controller.index);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

//router.post('/test', controller.test);

export default router;
