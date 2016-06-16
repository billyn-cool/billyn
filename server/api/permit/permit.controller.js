/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/permits              ->  index
 * POST    /api/permits              ->  create
 * GET     /api/permits/:id          ->  show
 * PUT     /api/permits/:id          ->  update
 * DELETE  /api/permits/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import {Permit} from '../../sqldb';
import {PermitRole} from '../../sqldb';
import {Role} from '../../sqldb';
import {UserRole} from '../../sqldb';
var Promise = require('bluebird');

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    return entity.updateAttributes(updates)
      .then(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Permits
export function index(req, res) {
  //console.log('req.body',JSON.stringify(req.query));
  var mode = 'leaf';
  if(req.query.mode){
    mode = req.query.mode;
    delete req.query.mode;
  }
  if(req.query.permitId){
    return Permit.findById(req.query.permitId).then(function(permit){
      return permit.getChildren('leaf')
      .then(respondWithResult(res))
      .catch(handleError(res));
    });
  } else {
      if(req.query.spaceId){
        return Permit.getPermitRoot(req.query).then(function(permitRoot){
          //var findData = req.query;
          //findData.mode = 'leaf';
          return permitRoot.getChildren('leaf')
          .then(respondWithResult(res))
          .catch(handleError(res));
        });
    }
  }

  //console.log('1');

  //return with error
  res.status(500).send('fail, please check input!');
  /*
  Permit.findAll(req.query)
    .then(respondWithResult(res))
    .catch(handleError(res));
    */
}

// Gets a single Permit from the DB
export function show(req, res) {
  Permit.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Permit in the DB
export function create(req, res) {
  return addPermit(req,res);
  /*
  Permit.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));*/
}

// Creates a new Permit in the DB
export function findOrCreate(req, res) {
  return addPermit(req,res);

  /*
  console.log('1');
  return Permit.findOrCreate({
    where:req.body,
    defaults: {}
  }).spread(function(row,created){
    //console.log('2 created:', created);
    //console.log('row:',row.get({plain: true}));
    res.status(200).json(row);
    //return Promise.resolve(row);
  })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
    */
}

// Updates an existing Permit in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Permit.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Permit from the DB
export function destroy(req, res) {
  Permit.destroy({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// Deletes a Permit from the DB
export function destroyPermitRole(req, res) {
  PermitRole.destroy({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}


export function getPermit(req, res) {
  var permitData = req.body;
  Permit.find({
      include: [{all: true}],
      where: permitData
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function addPermit(req, res) {
  var permitData = req.body;
  Permit.addPermit(permitData)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function addChild(req, res){
  //console.log('req params:',req);
  Role.find({
    _id: req.params.id
  })
  .then(function(role){
    //console.log('role:',role);
    role.addChild(req.body).then(respondWithResult(res));
  })
  .catch(handleError(res));
}

// get: api/permits/roles
export function findAllPermitRole(req, res){

  var query = req.query;

  PermitRole.belongsTo(Permit,{as: 'permit'});
  PermitRole.belongsTo(Role,{as: 'role'});

  return PermitRole.findAll({
    where: query,
    include: [
    {
      model: Permit, as: 'permit'
    },{
      model: Role, as: 'role'
    }]
  }).then(respondWithResult(res, 201))
    .catch(handleError(res));
}

//get: api/permits/roles/user, should contain spaceId for find user roles
export function findAllUserPermitRole(req, res){

  PermitRole.belongsTo(Permit,{as: 'permit'});
  PermitRole.belongsTo(Role,{as: 'role'});

  var query = req.query;

  if(!query.spaceId || !query.userId){
    handleError(res);
  } else {
    var whereData = {};
    whereData.userId = query.userId;
    whereData.spaceId = query.spaceId;

    delete query.userId;
    delete query.spaceId;

    UserRole.findAll({
      where: whereData
    }).then(function(rows){
      
      var or = [];
      rows.forEach(function(row){
        or.push({
          roleId: row.roleId
        });
      });
      query['$or'] = or;

      PermitRole.findAll({
        where:query,
        include: [
         {
           model: Permit, as: 'permit'
         },
         {
           model: Role, as: 'role'
         }
        ]
      })
    })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
  }
}

export function findPermitRole(req, res){

  PermitRole.belongsTo(Permit, {as: 'permit'});
  PermitRole.belongsTo(Role, {as: 'role'});
  PermitRole.find({
    where: {
      _id: req.params.id
    },
    include: [
      {
        model: Permit, as: 'permit'
      },
      {
        model: Role, as: 'role'
      }
    ]
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function createPermitRole(req, res){
  //console.log(req.body);
  PermitRole.belongsTo(Permit,{as: 'permit'});
  PermitRole.belongsTo(Role, {as: 'role'});
  var body = req.body;
  var spaceId;

  if(body.spaceId){
    spaceId = body.spaceId;
  }

  PermitRole.findOrCreate({
    where: req.body,
    defaults: {}
  })
    .spread(function(row,created){
      return PermitRole.find({
        where: {_id: row._id},
        include: [{
          model: Permit, as: 'permit'
        },
        {
          model: Role, as: 'role'
        }
        ]
      })
    })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function addBulkPermitRole(req, res){

  //console.log('body',JSON.stringify(req.body));

  var rows = req.body;

  Promise.map(rows, function(row){
    return new Promise(function(resolve,reject){
       if(row.spaceId && row.permit){
         var permitData = {};
         if(typeof row.permit === 'object'){
           permitData = row.permit;
         }
         if(typeof row.permit === 'string'){
           permitData.name = row.permit;
         }
         permitData.spaceId = row.spaceId;
          return Permit.addPermit(permitData).then(function(permit){
              row.permitId = permit._id;
              return resolve(permit);
            })
        } else {
          return resolve(null);
        }
    }).then(function(){
      //console.log('2');
      if(row.spaceId && row.role){
          return Role.find({
            where: {
              spaceId: row.spaceId,
              fullname: 'root.'+row.role
            }
          }).then(function(role){
              //console.log('role:', JSON.stringify(role));
              row.roleId = role._id;
              return Promise.resolve(null);
          });
        } else {
          return Promise.resolve(null);
        }
    })
  }).then(function(){
    //console.log(3);
    //console.log('rows:',JSON.stringify(rows));
    PermitRole.bulkCreate(rows).then(function(){
        res.send('success');
    });  
  });
}
