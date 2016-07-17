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
import {Collab} from '../../sqldb';
import {Category} from '../../sqldb';
import {CollabRole} from '../../sqldb';
import {Role} from '../../sqldb';
import {Space} from '../../sqldb';
import {PermitRole} from '../../sqldb';
import {Permit} from '../../sqldb';
import {Nut} from '../../sqldb';
import {User} from '../../sqldb';
import {UserRole} from '../../sqldb';
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

// Gets a list of collab
export function index(req, res) {

  console.log('index req.body:', JSON.stringify(req.body));
  var spaceId, type;

  if (req.body.spaceId) {
    spaceId = req.body.spaceId;
  }

  if (req.query.spaceId) {
    spaceId = req.query.spaceId;
  }

  if (!spaceId) {
    res.status(500).send('please provide spaceId!');
  }

  Collab.belongsTo(Category, { as: 'type' });
  //Collab.hasMany(CollabRole, { foreignKey: 'collabId', as: 'collabRoles' });
  //that.hasMany(CollabRole,{foreignKey: 'collabId', as:'childRoles'});
  //CollabRole.belongsTo(Role, { as: 'role' });
  Collab.belongsToMany(Role, { as: 'roles', through: 'CollabRole' });
  Role.belongsTo(Space, { as: 'space' });

  var findData = {
    spaceId: spaceId
  }

  var includeData = [
    {
      model: Category, as: 'type'
    },
    {
      model: Role, as: 'roles',
      include: [
        {
          model: Space, as: 'space'
        }
      ]
    }
  ]
  Collab.findAll({
    where: findData,
    include: includeData
  })
    /*
    Collab.getCollabRoot().then(function (collabRoot) {
      //console.log('collab.controller collabRoot:', JSON.stringify(collabRoot));
      return collabRoot.getChildren({
        spaceId: spaceId,
        mode: 'all'
      })
    })*/
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single collab from the DB
export function show(req, res) {
  //console.log(JSON.stringify(req.body.params));
  var findData = {};

  Collab.belongsTo(Category, { as: 'type' });

  findData.include = [
    {
      model: Category, as: 'type'
    }
  ]

  if (req.params.id) {
    findData.where = {
      _id: req.params.id
    }
  }

  Collab.find(findData)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Collab in the DB
export function create(req, res) {
  //console.log('Collab create req.body:', JSON.stringify(req.body));
  var collabData = req.body;

  if (!collabData.spaceId) {
    res.status(500).send('please provide spaceId');
  }

  Collab.add(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));

  /*
  var type;
  for (var key in collabData) {
    if (key.toLowerCase() === 'type' || key.toLowerCase() === 'typename') {
  		  type = collabData[key];
  		  delete collabData[key];
    }
  }

  if (collabData.name) {
    var collabName = collabData.name;
    // delete collabData.name;
  }

  if (!collabData.type && !collabData.typeId) {
    type = 'normal';
  }

  if (type && collabName) {
    if(typeof type === 'string'){
      type = {
        name: type
      }
    }
    type.spaceId = collabData.spaceId;
    //console.log('create collab typeName:', typeName);
    Collab.addType(type).then(function (type) {
  		  collabData.typeId = type._id;
      Collab.add(collabData)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
      //     Collab.findOrCreate({
      // where: {name: collabName},
      // defaults:collabData})
      //     .then(respondWithResult(res, 201))
      //     .catch(handleError(res));
    })
  } else {
    // Collab.create(collabData)
    // .then(respondWithResult(res, 201))
    // .catch(handleError(res));
  }*/
}

export function bulkCreate(req, res) {

  var listData = req.body;

  if (req.params.spaceId) {
    listData.spaceId = req.params.spaceId;
  }

  //console.log('listData:',JSON.stringify(listData));

  Collab.bulkAdd(listData)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Collab in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Collab.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Collab from the DB
export function destroy(req, res) {
  Collab.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

//post: /api/collabs/role
export function addCollabRole(req, res) {

  CollabRole.add(req.body)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function bulkAddCollabRole(req, res) {
  CollabRole.bulkAdd(req.body)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

//get: /api/collabs/role
export function findAllColplayRole(req, res) {

  if (params.id == 'findAllJoinRoleByRoleList') {

    var roleIdList = JSON.parse(req.query.roleIdList);

    var orData = [];

    roleIdList.forEach(function (id) {
      var o = {
        roleId: id
      };
      orData.push(o);
    });

    CollabRole.findAll({
      where: {
        $or: orData
      }
    })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }
  else {
    var queryData = req.query;

    CollabRole.findAll({
      where: req.query
    })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }



}

//get: /api/collabs/role/:id
export function findCollabRole(req, res) {

  CollabRole.findById(req.params.id)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Collab role from the DB
export function destroy(req, res) {
  CollabRole.destroy({
    _id: req.params.id
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function findAllJoinableSpace(req, res) {

  //console.log('req.body:',JSON.stringify(req.body));
  //console.log('req.query:',JSON.stringify(req.query));
  var spaceId;

  if (req.body.spaceId) {
    spaceId = req.body.spaceId;
  }

  if (req.query.spaceId) {
    spaceId = req.query.spaceId;
  }

  if (!spaceId) {
    //console.log('spaceId:',spaceId);
    res.status(500).send('please provide spaceId!');
  }

  console.log('spaceId:', spaceId);

  CollabRole.belongsTo(Role, { as: 'role' });
  CollabRole.belongsTo(Collab, { as: 'collab' });
  Collab.belongsTo(Space, { as: 'space' });
  Space.belongsTo(Category, { as: 'type' });
  Space.hasMany(Collab, { as: 'collabs' });
  Space.hasMany(Role, { as: 'roles' });
  Role.hasMany(CollabRole, { as: 'collabRoles' });
  Role.belongsTo(Space);
  Role.belongsToMany(Collab, { through: 'CollabRole', foreignKey: 'roleId', as: 'collabs' });
  Collab.belongsToMany(Role, { through: 'CollabRole', foreignKey: 'collabId', as: 'roles' });

  return Space.findAll({
    where: {
      _id: {
        $ne: spaceId
      }
    },
    include: [
      {
        model: Collab, as: 'collabs',
        include: [
          {
            model: Role, as: 'roles',
            where: {
              spaceId: spaceId
            },
            through: {
              where: {
                roleType: "child"
              }
            }
          }
        ]
      }
    ]
  }).then(function (joinedSpaces) {
    var jIdList = [];
    joinedSpaces.forEach(function (o) {
      jIdList.push(o._id);
    });

    var whereData = {
      _id: {
        $ne: spaceId
      }
    };

    if (jIdList.length > 0) {
      whereData._id[$notIn] = jIdList;
    }

    return Space.findAll({
      where: whereData,
      include: [
        {
          model: Collab, as: 'collabs',
          include: [
            {
              model: Role, as: 'roles'
            }
          ]
        }
      ]
    })
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function findAllJoinedSpace(req, res) {
  //console.log('req.body:',JSON.stringify(req.body));
  //console.log('req.query:',JSON.stringify(req.query));
  var spaceId;

  if (req.body.spaceId) {
    spaceId = req.body.spaceId;
  }

  if (req.query.spaceId) {
    spaceId = req.query.spaceId;
  }

  if (!spaceId) {
    //console.log('spaceId:',spaceId);
    res.status(500).send('please provide spaceId!');
  }

  //console.log('spaceId:', spaceId);

  CollabRole.belongsTo(Role, { as: 'role' });
  CollabRole.belongsTo(Collab, { as: 'collab' });
  Collab.belongsTo(Space, { as: 'space' });
  Space.belongsTo(Category, { as: 'type' });
  Space.hasMany(Collab, { as: 'joinedCollabs' });
  Space.hasMany(Collab, { as: 'collabs' });
  Space.hasMany(Role, { as: 'roles' });
  Role.hasMany(CollabRole, { as: 'collabRoles' });
  Role.belongsToMany(Collab, { through: 'CollabRole', foreignKey: 'roleId', as: 'collabs' });
  Collab.belongsToMany(Role, { through: 'CollabRole', foreignKey: 'collabId', as: 'childRoles' });

  Space.findAll({
    where: {
      _id: {
        $ne: spaceId
      }
    },
    include: [
      {//find joinedCollab
        model: Collab, as: 'joinedCollabs',
        include: [
          {
            model: Role, as: 'childRoles',
            where: {
              spaceId: {
                $eq: spaceId
              }
            },
            through: {
              where: {
                roleType: 'child'
              }
            }
          }
        ]
      },
      {//find all collabs for space,it is useful for continuing apply
        model: Collab, as: 'collabs'
      }
    ]
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function findAllUserNutPermit(req, res) {
  var userId, spaceId;

  if (req.query.spaceId) {
    spaceId = req.query.spaceId;
  } else {
    res.status(500).send('please provide spaceId!');
  }

  if (req.query.userId) {
    userId = req.query.userId;
  } else {
    res.status(500).send('please provide userId!');
  }

  /**
   * 1. find user roles in space
   * 2. find parent roles through CollabRole table
   * 3. find NutPermit through parent roles
   * 4. organize all NutPermit
   */
  Collab.findAllUserNutPermit(userId, spaceId)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));


}

/**
 * return: NutPermitRole
 * require query: spaceId,userId
 * optional query: nutId, collabId
 */
export function findAllUserNutPermitByCollab(req, res) {


  var nutId = req.query.nutId;
  var spaceId = req.query.spaceId;
  var userId = req.query.userId;
  var collabId = req.query.collabId;

  if (!spaceId || !userId) {
    res.status(500).send('please provide spaceId and userId');
  }

  PermitRole.belongsTo(Role, { as: 'role' });
  PermitRole.belongsTo(Permit, { as: 'permit' });
  PermitRole.belongsTo(Nut, { as: 'nut', foreignKey: 'ownerId' });
  Role.belongsToMany(Collab, { as: 'collabs', through: 'CollabRole' });
  Collab.belongsToMany(Role, { as: 'childRoles', through: 'CollabRole' });
  Role.belongsToMany(User, { as: 'users', through: 'UserRole' });
  User.belongsToMany(Role, { as: 'roles', through: 'UserRole' });
  Collab.hasMany(CollabRole, { as: 'collabRoles', foreignKey: 'collabId' });

  var userInclude = { model: User, as: 'users' };
  if (userId) {
    userInclude.where = { _id: userId }
  }

  var childRoleInclude = {
    model: Role, as: 'childRoles',
    where: {
      spaceId: {
        $ne: spaceId
      }
    },
    include: [
      userInclude
    ]
  }

  var collabInclude = {
    model: Collab, as: 'collabs',
    include: [
      childRoleInclude
    ]
  }

  if (collabId) {
    collabInclude.where = {
      _id: collabId
    }
  }

  var nutInclude = {
    model: Nut, as: 'nut'
  }

  if (nutId) {
    nutInclude.where = {
      _id: nutId
    }
  }

  PermitRole.findAll({
    include: [
      {
        model: Role, as: 'role',
        where: { spaceId: spaceId },
        include: [
          collabInclude
        ]
      },
      nutInclude,
      {
        model: Permit, as: 'permit'
      }
    ]
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function findAllParentRole(req, res) {

}
