/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {
  // Insert routes below
  app.use('/api/wechats', require('./api/wechat'));
  app.use('/api/roles', require('./api/role'));
  app.use('/api/permits', require('./api/permit'));
  app.use('/api/attributes', require('./api/attribute'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));
  app.use('/api/spaces', require('./api/space'));
  app.use('/api/apps', require('./api/app'));
  app.use('/api/nuts', require('./api/nut'));
  app.use('/api/types', require('./api/category/type'));
  app.use('/api/categories', require('./api/category'));
  app.use('/api/circles', require('./api/circle'));
  app.use('/api/collabs', require('./api/collab'));
  app.use('/api/vouchers', require('./api/voucher'));
  
  app.use('/auth', require('./auth'));
  
  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // mobile routes
  app.route('/mobile')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/mobile/index.html'));
    });

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
