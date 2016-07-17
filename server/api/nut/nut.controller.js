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
import {Nut} from '../../sqldb';
import {Permit} from '../../sqldb';
import {Role} from '../../sqldb';
import {PermitRole} from '../../sqldb';
import {UserRole} from '../../sqldb';
import {Category} from '../../sqldb';
import {App} from '../../sqldb';
var Promise = require('bluebird');

var permitController = require('../permit/permit.controller');

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

// Gets a list of Nuts
//
export function index(req, res) {

  Nut.belongsTo(Category, { as: 'type' });

  //console.log('req.query:',JSON.stringify(req.query));

  var nutName = req.query.name || req.query.nutName || undefined;
  var spaceId = req.query.spaceId || req.query.spaceid || undefined;
  var appId = req.query.appId || req.query.appid || undefined;

  var nutData = {};
  if (nutName) {
    nutData.name = nutName.toLowerCase();
  }

  if (spaceId && appId) {
    nutData.spaceid = spaceId;
    nutData.appId = appId;
    //console.log('nutData:',JSON.stringify(nutData));
    Nut.findAll({
      where: nutData,
      include: [{
        model: Category, as: 'type'
      }]
    })
      .then(handleEntityNotFound(res))
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    res.status(500).send('please check input!');
  }
}

// Gets a single Nut from the DB
export function show(req, res) {

  Nut.belongsTo(Category, { as: 'type' });

  //console.log('req.query:',JSON.stringify(req.query));

  var param = req.params.id;
  var nutId = req.params.id || req.query.id || req.query.nutId || undefined;
  var nutName = req.query.name || req.query.nutName || undefined;
  var spaceId = req.query.spaceId || req.query.spaceid || undefined;
  var appId = req.query.appId || req.query.appid || undefined;

  //console.log('req.query:',JSON.stringify(req.query));

  var nutData = {};
  if (nutName) {
    nutData.name = nutName.toLowerCase();
  }

  if (nutId) {
    Nut.find({
      where: {
        _id: nutId
      },
      include: [{
        model: Category, as: 'type'
      }]
    })
      .then(handleEntityNotFound(res))
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  if (spaceId && appId) {
    //console.log('nutData:',JSON.stringify(nutData));
    Nut.find({
      where: nutData,
      include: [{
        model: Category, as: 'type'
      }]
    })
      .then(handleEntityNotFound(res))
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

}

// Creates a new Nut in the DB
export function create(req, res) {
  //console.log('Nut create req.body:', JSON.stringify(req.body));
  var nutData = req.body;
  var typeName;
  for (var key in nutData) {
    if (key.toLowerCase() === 'type' || key.toLowerCase() === 'typename') {
  		  typeName = nutData[key];
  		  delete nutData[key];
    }
  }

  if (nutData.name) {
  		var nutName = nutData.name;
  		// delete nutData.name;
  }

  if (typeName && nutName) {
    //console.log('create nut typeName:',typeName);
    Nut.addType(typeName).then(function (type) {
  		  nutData.typeId = type._id;
      Nut.create(nutData)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
      //     Nut.findOrCreate({
      // where: {name: nutName},
      // defaults:nutData})
      //     .then(respondWithResult(res, 201))
      //     .catch(handleError(res));
    })
  } else {
    // Nut.create(nutData)
    // .then(respondWithResult(res, 201))
    // .catch(handleError(res));
  }
}

// Updates an existing Nut in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Nut.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Nut from the DB
export function destroy(req, res) {
  Nut.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

//get: query {userId, spaceId, appId}
export function findAllUserPermitNut(req, res) {

  PermitRole.belongsTo(Permit, { as: 'permit' });
  PermitRole.belongsTo(Role, { as: 'role' });
  PermitRole.belongsTo(Nut, { foreignKey: 'ownerId', as: 'nut' });
  Nut.belongsTo(Category, { as: 'type' });
  Nut.belongsTo(App, { as: 'app' });
  App.belongsTo(Category, { as: 'type' });

  var query = {};
  //console.log('query 1:', JSON.stringify(query));

  if (!req.query.spaceId || !req.query.userId) {
    res.status(500).send('please provice spaceId and userId!');
  } else {
    var whereData = {};
    whereData.userId = req.query.userId;
    whereData.spaceId = req.query.spaceId;

    query.spaceId = req.query.spaceId
    var spaceId = req.query.spaceId;

    //delete query.userId;
    //delete query.spaceId;

    //console.log('query 2:', JSON.stringify(query));

    var userRoleList = [];

    UserRole.findAll({
      where: whereData
    }).then(function (rows) {

      //console.log('roles:', JSON.stringify(rows));

      var or = [];
      rows.forEach(function (row) {
        userRoleList.push(row.roleId);
        or.push({
          roleId: row.roleId
        });
      });
      query['$or'] = or;

      //console.log('query 4:', JSON.stringify(query));

      var permitRoles;
      var nutInclude = {
        model: Nut, as: 'nut',
        include: {
          model: App, as: 'app'
        },
        where: {
          spaceId: spaceId
        }
      }

      if (req.query.hasOwnProperty('appId') && req.query.appId > 0) {
        nutInclude.where = {
          appId: req.query.appId
        };
      }

      if (req.query.hasOwnProperty('nutId') && req.query.nutId > 0) {
        nutInclude.where = {
          _id: req.query.nutId
        };
      }

      //console.log('nutInclude:',nutInclude);

      //console.log('req.query 5:', JSON.stringify(req.query));

      //add everyone role and add to user role list
      //it will make sure user have everyone permit nut
      return Role.addRole({
        spaceId: req.query.spaceId,
        name: 'everyone'
      }
      ).then(function (eRole) {
        //console.log('everyone role:',JSON.stringify(eRole));
        userRoleList.push(eRole._id);
        or.push(eRole._id);
        query['$or'] = or;
        //console.log('userRoleList:', JSON.stringify(userRoleList));
        return PermitRole.findAll({
          //where: query,
          include: [
            {
              model: Permit, as: 'permit'
            },
            {
              model: Role, as: 'role',
              where: {
                _id: {
                  $in: userRoleList
                }
              }
            },
            nutInclude
          ]
        })
      })
    })
      /*.then(function(rows){
        
        //console.log('rows:',JSON.stringify(rows));

        permitRoles = JSON.parse(JSON.stringify(rows));

        var or = [];

        rows.forEach(function(row){
          or.push({
            _id: row.ownerId
          });
        });
        
       console.log('1 appInclude:');
        
        var appInclude = {
          model: App,
          as: 'app',
          include: [{
            model: Category, as: 'type'
          }]
        };
        
        console.log('2 appInclude:');
        
        if(req.query.hasOwnProperty('appId') && req.query.appId >0){
          appInclude.where = {
            _id: req.query.appId
          };
        }
        
        //console.log('appInclude:',appInclude);

        return Nut.findAll({
          where: {$or: or},
          include: [
            {
              model: Category, as: 'type'
            },
            appInclude
            
            {
              model: App, as: 'app',
              include: [
                {model: Category, as: 'type'}
              ]
            }
          ]
        }).then(function(nuts){
          //console.log('nuts',JSON.stringify(nuts));
          permitRoles.forEach(function(pr){
            nuts.forEach(function(nut){
              if(pr.ownerId === nut._id){
                pr.nut = nut;
              }
            })
          });
          return Promise.resolve(permitRoles);
        });
      })
    })*/
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  }

}

/**
 * find space nut permit role: {spaceId}
 * find app nut permit roles: {appId}
 * find permit roles for nut: {nutId}
 */
export function findAllPermitRole(req, res) {

  PermitRole.belongsTo(Permit, { as: 'permit' });
  PermitRole.belongsTo(Role, { as: 'role' });
  PermitRole.belongsTo(Nut, { foreignKey: 'ownerId', as: 'nut' });
  Nut.belongsTo(Category, { as: 'type' });
  Nut.belongsTo(App, { as: 'app' });
  App.belongsTo(Category, { as: 'type' });

  var spaceId, appId, nutId;
  var findData;

  if (req.query.spaceId) {
    spaceId = req.query.spaceId;
    findData = {};
    findData.where = {};
    findData.where.spaceId = req.query.spaceId;
    findData.where.owner = 'nut';
  }

  if (req.query.nutId) {
    findData = {};
    findData.where = {};
    findData.where.ownerId = req.query.nutId;
    findData.where.owner = 'nut';
  }

  if (req.query.roleId) {
    findData = {};
    findData.where = {};
    findData.where.roleId = req.query.roleId;
    findData.where.owner = 'nut';
  }

  if (req.query.appId) {
    appId = req.query.appId;
    findData = {};
    findData.where = {};
    //appId = req.query.nutId;
    findData.where.owner = 'nut';
    findData.include = [{
      model: Nut,
      as: 'nut',
      where: {
        appId: appId
      }
    }];
  }

  //console.log('nutController findAllPermitRole spaceId:',spaceId);

  if (typeof findData === 'object') {
    if (!findData.include) {
      findData.include = [];
      findData.include.push({
        model: Nut, as: 'nut'
      });
    }
    ///*
    findData.include.push({
      model: Permit, as: 'permit'
    });//*/

    findData.include.push({
      model: Role, as: 'role'
    });

    PermitRole.findAll(findData)
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  } else {
    res.status(500).send('please check input!');
  }

}

