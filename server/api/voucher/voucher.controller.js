/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/apps              ->  index
 * POST    /api/apps              ->  create
 * GET     /api/apps/:id          ->  show
 * PUT     /api/apps/:id          ->  update
 * DELETE  /api/apps/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import {Voucher} from '../../sqldb';
import {User} from '../../sqldb';
import {Role} from '../../sqldb';
import {UserRole} from '../../sqldb';
import {Timeslot} from '../../sqldb';
import {Category} from '../../sqldb';
import {Attribute} from '../../sqldb';
var Promise = require('bluebird');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function (entity) {
    return entity.updateAttributes(updates)
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Vouchers
export function index(req, res) {
  Voucher.findAll({
    where: req.query
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Voucher from the DB
export function show(req, res) {
  Voucher.hasMany(Attribute, { foreignKey: "ownerId", as: "attributes" });
  Voucher.find({
    where: {
      _id: req.params.id
    },
    include: {
      model: Attribute, as: "attributes",
      where: {
        value: {
          $ne: null
        }
      }
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Voucher in the DB
//post data format:
/*
     {
        "type": {
          "name": "discount.percent",
          "alias": "discount_percent",
          "attributes":{
            "unit":"percent"
          }
        },
        "name": "discount_percent_10",
        "alias": "9折券",
        "description":"",
        "value": "10",
        "grants": {
          "customer": "allow.apply,allow.collect,allow.use",
          "manager": "allow.issue",
          "cashier": "allow.cash",
          "admin": "allow.admin"
        },
        "timeslots": {
          "use": {
            "start": "now",//if not provice start or end, default is now
            "start.offset.value": -10,
            "start.offset.unit": "day",
            "end": "now",
            "end.offset.value": 10,
            "end.offset.unit": "day"
          },
          "collect": {
            "start": "now",
            "start.offset.value": -10,
            "start.offset.unit": "day",
            "end": "now",
            "end.offset.value": 10,
            "end.offset.unit": "day" 
          },
        }
      }
*/
export function create(req, res) {

  var voucherData = req.body;

  if (req.query.spaceId) {
    voucherData.spaceId = req.query.spaceId;
  }

  Voucher.add(voucherData)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function bulkCreate(req, res) {
  var vouchers = req.body;
  if (req.query.spaceId) {
    vouchers.forEach(function (v) {
      v.spaceId = req.query.spaceId;
    })
  }
  //console.log('vouchers in bulkCreate:', JSON.stringify(vouchers));
  Voucher.bulkAdd(vouchers)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Voucher in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Voucher.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Voucher from the DB
export function destroy(req, res) {
  Voucher.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function findAllUserVoucher(req, res) {
  VoucherUser.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function findUserVoucher(req, res) {
  VoucherUser.find({
    where: {
      userId: req.params.userId
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}
/*
method: post
post data format: {
  userId: xxx,
  typeId: xxx,
  startTime: xxx[optional],
  endTime: xxx[optional]
}
this function do things below:
1. find spaceId from typeId
2. populate timeslot from attributes of type
3. check permit according to user' role with setting in voucher type
4. check voucher exist or not, then ignore or add
*/
///*
export function addUserVoucher(req, res) {
  //console.log('addUserVoucher req.body:', JSON.stringify(req.body));
  var body = req.body;
  var userId;
  var typeId;
  var startTime;
  var endTime;
  var spaceId;
  var newVoucher;
  //if provide status, it will update status accordingly
  // by default, only choose allow.use voucher to add
  var voucherStatus = req.body.status || 'allow.use';

  if (!body.userId) {
    res.status(500).send('please provide userId');
  } else {
    userId = body.userId;
  }

  if (!body.typeId) {
    res.status(500).send('please provide typeId');
  } else {
    typeId = body.typeId;
  }

  startTime = body.startTime || null;
  endTime = body.endTime || null;

  var theType;

  return Voucher.getType(typeId).then(function (type) {
    theType = type;
    //console.log('addUserVoucher type:', JSON.stringify(type));
    spaceId = type.spaceId;
    var attributes = type.attributes;
    var attrObj = Attribute.toObject(attributes);
    var timeSlotData = attrObj.timeslot;
    var grantData = attrObj.grant;

    User.belongsToMany(Role, { as: 'roles', through: UserRole });
    Role.belongsToMany(User, { as: 'users', through: UserRole });

    return User.find({
      where: {
        _id: userId
      },
      include: [
        {
          model: Role, as: 'roles'
        }
      ]
    }).then(function (user) {
      //console.log('addUserVoucher user:', JSON.stringify(user));
      console.log('addUserVoucher grantData:', JSON.stringify(grantData));
      var userRoles = user.roles;
      //find permits in grant against user's roles
      var userPermits = [];
      var userTimeslot = {};
      //console.log('addUserVoucher userRoles:', JSON.stringify(userRoles));
      userRoles.forEach(function (role) {
        var rName = role.name;
        //find permits for user
        if (grantData[rName] && role.spaceId === theType.spaceId) {
          var permit = grantData[rName];
          var tPermits = permit.split(',');
          tPermits.forEach(function (e) {
            if (userPermits.indexOf(e) === -1) {
              userPermits.push(e);
            }
          });
          //console.log('addUserVoucher tPermits:', JSON.stringify(tPermits));
          //userPermits.concat(tPermits);
        }
      });
      console.log('addUserVoucher userPermits:', JSON.stringify(userPermits));

      /*
      if(voucherStatus in userPermits){
        //userTimeslot.apply = timeSlotData.apply;
        voucherStatus = 'allow.apply';
      }
      if('allow.collect' in userPermits && timeSlotData.collect){
        //userTimeslot.collect = timeSlotData.collect;
        voucherStatus = 'allow.collect';
      }
      if('allow.use' in userPermits && timeSlotData.use){
        //userTimeslot.use = timeSlotData.use;
        voucherStatus = 'allow.use';
      }
      */

      //console.log('voucherStatus 1:',voucherStatus);
      //console.log('timeSlotData:',JSON.stringify(timeSlotData));

      //if user is allowed for apply or collect or use, add it to voucher table
      if (userPermits.indexOf(voucherStatus) != -1 || userPermits.indexOf('allow.admin') != -1) {

        // console.log('voucherStatus 2:',voucherStatus);

        //filter timeslot according to status
        for (var key in timeSlotData) {
          if ('allow.' + key === voucherStatus) {
            userTimeslot[key] = timeSlotData[key];
          }
        }

        return Voucher.findOrCreate({
          where: {
            userId: userId,
            typeId: typeId,
            spaceId: spaceId
          },
          defaults: {
            status: voucherStatus
          }
        }).spread(function (voucher, created) {
          // console.log('addUserVoucher voucher:', JSON.stringify(voucher));
          //create voucher or update status
          if (!created && voucher.status !== voucherStatus) {
            voucher.status = voucherStatus;
            return voucher.save();
          } else {
            return Promise.resolve(voucher);
          }
        }).then(function (voucher) {

          console.log('addUserVoucher2 voucher:', JSON.stringify(voucher));

          newVoucher = voucher;

          return Timeslot.addTimeslots(userTimeslot, { owner: 'voucher', ownerId: voucher._id });
        })
          .then(function () {
            return Promise.resolve(newVoucher);
          });
      } else {
        return Promise.reject('fail to add vouher');
      }
    });
  })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));

} //*/

export function batchAddUserVoucher(req, res) {

}

export function deleteUserVoucher(req, res) {
  VoucherUser.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function addType(req, res) {

  Voucher.addType(req.body)
    .then(respondWithResult(res))
    .catch(handleError(res));

  /*

  var typeData = {};
  var attributeData = [];
  var grants, timeslots;
  var spaceId;

  if (req.query && req.query.spaceId) {
    spaceId = req.query.spaceId;
  }

  //console.log('req.body', JSON.stringify(req.body));

  for (var key in req.body) {

    if (key === 'name') {
      var vName = req.body.name;
      if (!vName.indexOf('voucher') === 0) {
        vName
      }
      typeData.name = req.body.name;
    }

    if (key === 'alias') {
      typeData.alias = req.body.alias;
    }

    if (key === 'spaceId') {
      spaceId = typeData.spaceId = req.body.spaceId;
    }

    if (key === 'voucherMode') {
      attributeData.push({
        name: 'voucher.mode',
        value: req.body.voucherMode,
        spaceId: spaceId,
        owner: 'voucherType'
      });
    }

    if (key === 'voucherValue') {
      attributeData.push({
        name: 'voucher.value',
        value: req.body.voucherValue,
        spaceId: spaceId,
        owner: 'voucherType'
      });
    }

    if (key === 'voucherUnit') {
      attributeData.push({
        name: 'voucher.unit',
        value: req.body.voucherUnit,
        spaceId: spaceId,
        owner: 'voucherType'
      });
    }

    if (key === 'minExpense') {
      attributeData.push({
        name: 'voucher.minExpense.value',
        value: req.body.minExpense.value,
        spaceId: spaceId,
        owner: 'voucherType'
      });
      attributeData.push({
        name: 'voucher.minExpense.currency',
        value: req.body.minExpense.currency,
        spaceId: spaceId,
        owner: 'voucherType'
      });
    }

    if (key === 'minGroup') {
      attributeData.push({
        name: 'voucher.minGroup',
        value: req.body.minGroup,
        spaceId: spaceId,
        owner: 'voucherType'
      });
    }

    if (key === 'timeslots') {
      timeslots = req.body.timeslots;
      //console.log('timeslots:',JSON.stringify(timeslots));
      for (var tKey in timeslots) {
        var oTimeSlot = timeslots[tKey];
        //console.log('oTimeSlot:',JSON.stringify(oTimeSlot));
        for (var oKey in oTimeSlot) {
          attributeData.push({
            name: 'timeslot.' + tKey + '.' + oKey,
            value: oTimeSlot[oKey],
            spaceId: spaceId,
            owner: 'voucherType'
          });
        }
      }
    }

    if (key === 'grants') {
      grants = req.body.grants;

      for (var key in grants) {
        attributeData.push({
          name: 'grant.' + key,
          value: grants[key],
          spaceId: spaceId,
          owner: 'voucherType'
        });
      }
    }
  }

  var newType;

  if (!spaceId) {
    res.status(500).send('please provide spaceId');
  }

  typeData.spaceId = spaceId;

  //console.log('attributeData:',JSON.stringify(attributeData));

  Voucher.addType(typeData).then(function (type) {
    //console.log('type:',JSON.stringify(type));
    newType = type;
    newType = JSON.parse(JSON.stringify(newType));
    if (!_.isEmpty(attributeData)) {
      attributeData.forEach(function (a) {
        a.ownerId = type._id;
      });

      //var ar = attributeData.slice(0);

      //console.log('ar:',JSON.stringify(ar));

      //newType.attributes = ar;
      //console.log('attributeData:',JSON.stringify(attributeData));
      return Voucher.addAttributes(attributeData);
    } else {
      return Promise.resolve(null);
    }
  }).then(function () {
    //console.log('grants:',JSON.stringify(grants));
    if (!_.isEmpty(grants)) {
      newType.grants = grants;
      return Role.addGrants(grants, { spaceId: spaceId, owner: 'voucherType', ownerId: newType._id });
    } else {
      return Promise.resolve(null);
    }
  }).then(function () {
    if (!_.isEmpty(timeslots)) {
      newType.timeslots = timeslots;
      //console.log('timeslots:',JSON.stringify(timeslots));
      //return Timeslot.addTimeslots(timeslots,{spaceId: spaceId, owner: 'voucherType', ownerId: newType._id});
    } else {
      return Promise.resolve(null);
    }
  }).then(function () {
    return Promise.resolve(newType);
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
    */
}

export function getVouchers(req, res) {
  var query = req.query;
  var spaceId = query.spaceId;

  //console.log('spaceId',spaceId);

  if (spaceId && spaceId > 0) {
    var whereData = {};
    whereData.spaceId = spaceId;
    var fVouchers = [];
    var theVoucher;
    Voucher.findAll(whereData).then(function (vouchers) {
      //console.log('types:',JSON.stringify(types));
      return Promise.map(vouchers, function (voucher) {
        //console.log('type:',JSON.stringify(type));
        theVoucher = voucher;
        return Voucher.getAttributes({
          owner: 'voucher',
          ownerId: voucher._id
        }).then(function (attributes) {
          //console.log('attributes:',JSON.stringify(attributes));
          theVoucher = JSON.parse(JSON.stringify(theVoucher));
          theVoucher.attributes = attributes;
          fVouchers.push(theVoucher);
          //console.log('fTypes:',JSON.stringify(fTypes));
          return Promise.resolve(null);
        });
        //console.log('types 2:',JSON.stringify(types));
        //fTypes = types;
      }).then(function () {
        //console.log('fTypes 2:',JSON.stringify(fTypes));
        return Promise.resolve(fVouchers);
      });
    })
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    res.status(500).send('please provide correct spaceId!');
  }
}

export function getVoucher(req, res) {

  //console.log('1');

  var typeId;

  if (req.params && req.params.id) {
    voucherId = req.params.id;
  }

  if (req.query && req.query.voucherId) {
    voucherId = req.query.voucherId;
  }

  if (voucherId && voucherId > 0) {
    return Voucher.findById(voucherId).then(function (voucher) {
      //console.log(' voucher:', JSON.stringify(voucher));
      return Voucher.getAttributes({
        owner: 'voucher',
        ownerId: voucherId,
        spaceId: voucher.spaceId
      }).then(function (attributes) {
        voucher = JSON.parse(JSON.stringify(voucher));
        voucher.attributes = attributes;
        //type.attributes = Attribute.toObject(attributes);
        return Promise.resolve(voucher);
      })
        .then(respondWithResult(res))
        .catch(handleError(res));
    })
  }
}
