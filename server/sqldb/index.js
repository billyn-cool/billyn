/**
 * Sequelize initialization module
 */

'use strict';

import path from 'path';
import config from '../config/environment';
import Sequelize from 'sequelize';

var db = {
  Sequelize,
  sequelize: new Sequelize(config.sequelize.uri, config.sequelize.options)
};

// Insert models below
db.Wechat = db.sequelize.import('../api/wechat/wechat.model');
db.Permit = db.sequelize.import('../api/permit/permit.model');
db.Attribute = db.sequelize.import('../api/attribute/attribute.model');
db.Thing = db.sequelize.import('../api/thing/thing.model');
db.User = db.sequelize.import('../api/user/user.model');
db.Category = db.sequelize.import('../api/category/category.model');
db.Space = db.sequelize.import('../api/space/space.model');
db.App = db.sequelize.import('../api/app/app.model');
db.SpaceApp = db.sequelize.import('../api/app/spaceApp.model');
db.Nut = db.sequelize.import('../api/nut/nut.model');
db.Role = db.sequelize.import('../api/role/role.model');
db.UserRole = db.sequelize.import('../api/role/userRole.model');
db.PermitRole = db.sequelize.import('../api/permit/permitRole.model');
db.Voucher = db.sequelize.import('../api/voucher/voucher.model');
db.VoucherUser = db.sequelize.import('../api/voucher/voucherUser.model');
db.Circle = db.sequelize.import('../api/circle/circle.model');
db.CircleSpace = db.sequelize.import('../api/circle/circleSpace.model');
db.CircleCollab = db.sequelize.import('../api/collab/circleCollab.model');
db.Collab = db.sequelize.import('../api/collab/collab.model');
db.CollabRole = db.sequelize.import('../api/collab/collabRole.model');
db.Timeslot = db.sequelize.import('../api/timeslot/timeslot.model');

export default db;
