/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/roles              ->  index
 * POST    /api/roles              ->  create
 * GET     /api/roles/:id          ->  show
 * PUT     /api/roles/:id          ->  update
 * DELETE  /api/roles/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import {Role} from '../../sqldb';
import {UserRole} from '../../sqldb';
import {Space} from '../../sqldb';
import {Category} from '../../sqldb';
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

// Gets a list of Roles
export function index(req, res) {

  var query = req.query;

  if (!_.isEmpty(query)) {

    if (query.userId && query.userId > 0) {
      return findUserRoles(req, res);
    }

    Role.getRoles(query)
      .then(respondWithResult(res))
      .catch(handleError(res));

  } else {
    res.status(500).send('error, please check params!');
  }

}

// Gets a single Role from the DB
export function show(req, res) {
  Role.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Role in the DB
export function create(req, res) {
  //Role.create(req.body)
  Role.addRole(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Role in the DB
export function update(req, res) {
  //return create(req, res);
  ///*
  var roleId;
  if (req.body._id) {
    roleId = req.body._id;
  }
  if (req.params.id) {
    roleId = req.params.id;
  }
  if (roleId) {
    Role.find({
      where: {
        _id: roleId
      }
    })
      .then(handleEntityNotFound(res))
      .then(saveUpdates(req.body))
      .then(respondWithResult(res))
      .catch(handleError(res));
  }
}

// Deletes a Role from the DB
export function destroy(req, res) {
  Role.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function getRole(req, res) {

  var whereData = {};

  if (req.params.id) {
    var id = req.params.id;
    if (isNaN(id)) {
      whereData.fullname = 'root.role.' + req.params.id;
    } else {
      whereData._id = req.params.id;
    }
  }
  if (req.params.name) {
    whereData.fullname = 'root.role.' + req.params.name;
  }
  if (req.query) {
    if (req.query.spaceId) {
      whereData.spaceId = req.query.spaceId;
    }
    if (req.query.name) {
      whereData.fullname = 'root.role.' + req.query.name;
    }
  }
  Role.find({
    where: whereData
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function addRole(req, res) {

  req.body.spaceId = req.params.spaceId;
  Role.addRole(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function addChild(req, res) {
  //console.log('1');
  //console.log('req.body:',console.log(JSON.stringify(req.body)));
  Role.find({
    where: {
      _id: req.params.id
    }
  })
    .then(function (role) {
      //console.log('role:',role);
      role.addChild(req.body).then(respondWithResult(res));
    })
    .catch(handleError(res));
}

export function getSpaceRoles(req, res) {

  Role.findAll({
    where: {
      spaceId: req.params.spaceId
    }
  }).then(respondWithResult(res))
    .catch(handleError(res));
}

// post: /api/roles/user
export function addUserRole(req, res) {

  var rId, uId, rName, spaceId;

  var body = req.body;

  if (body.roleId && body.roleId > 0) {
    rId = body.roleId;
  }
  if (body.userId && body.userId > 0) {
    uId = body.userId;
  }
  if (body.spaceId && body.spaceId > 0) {
    spaceId = body.spaceId;
  }
  if (!_.isNull(body.role)) {
    rName = body.role;
  }
  if (!_.isNull(body.name)) {
    rName = body.name;
  }

  if (rId > 0 && uId > 0 && spaceId > 0) {
    return UserRole.findOrCreate({
      where: {
        roleId: rId,
        userId: uId,
        spaceId: spaceId
      },
      defaults: {}
    }).spread(function (row, created) {
      return Promise.resolve(row);
    })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  if (rId > 0 && uId > 0) {
    return Role.findById(rId)
      .then(function (role) {
        UserRole.findOrCreate({
          where: {
            roleId: rId,
            userId: uId,
            spaceId: role.spaceId
          },
          defaults: {}
        }).spread(function (row, created) {
          return Promise.resolve(row);
        })
          .then(respondWithResult(res))
          .catch(handleError(res));
      });
  }

  if (!_.isNull(rName) && !_.isNull(spaceId) && uId > 0) {

    return Role.findOrCreate({
      where: {
        spaceId: spaceId,
        fullname: 'root.role.' + rName
      }
    }).spread(function (role, created) {
      UserRole.findOrCreate({
        where: {
          roleId: role._id,
          userId: uId,
          spaceId: spaceId
        },
        defaults: {}
      }).spread(function (row, created) {
        return Promise.resolve(row);
      })
        .then(respondWithResult(res))
        .catch(handleError(res));
    });
  }

  //if not find spaceId, find spaceId in role first
  /*
	if(!req.body.spaceId){
		Role.findById(req.body.roleId)
		.then(function(role){
			UserRole.create(req.body)
			.then(respondWithResult(res))
			.catch(handleError(res));
		});
	} else {
		UserRole.create(req.body)
		.then(respondWithResult(res))
		.catch(handleError(res));
	}*/
}

export function batchAddUserRole(req, res) {
  //console.log('req.body:',JSON.stringify(req.body));
  return UserRole.batchAdd(req.body)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function getChildren(req, res) {

  var parentId, parent, spaceId;

  if (req.params.id) {
    var id = req.params.id;
    if (isNaN(id)) {
      parent = 'root.role.' + req.params.id;
    } else {
      parentId = req.params.id;
    }
  }
  if (req.params.name) {
    parent = 'root.role.' + req.params.name;
  }
  if (req.query) {
    if (req.query.spaceId) {
      spaceId = req.query.spaceId;
    }
    if (req.query.name) {
      parent = 'root.role.' + req.query.name;
    }
  }
  var whereData = {};

  if (parentId === undefined && spaceId === undefined) {
    res.status(500).send('error, please provide spaceId or parentId!');
  }

  if (spaceId !== undefined) {
    whereData.spaceId = spaceId;
  }
  if (parentId !== undefined) {
    whereData.parentId = parentId;
  }
  if (parent !== undefined) {
    whereData.fullname = { $like: parent + '.%' }
  }

  console.log('getChildren whereData:', JSON.stringify(whereData));

  Role.findAll({
    where: whereData
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function batchAdd(req, res) {

}

export function findUserRoles(req, res) {

  UserRole.belongsTo(Role, { as: 'role' });
  Role.belongsTo(Space, { as: 'space' });
  Space.belongsTo(Category, { as: 'type' });

  var query = req.query;

  console.log('query:', JSON.stringify(query));

  if (!_.isEmpty(query) && query.userId && query.userId > 0) {

    UserRole.findAll({
      where: query,
      group: 'roleId',
      include: [{
        model: Role, as: 'role',
        include: {
          model: Space, as: 'space',
          include: {
            model: Category, as: 'type'
          }
        }
      }]
    }).then(function (rows) {
      var roles = [];

      rows.forEach(function (row) {
        roles.push(row.role);
      });

      return Promise.resolve(roles);

    })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }
}

export function addGrants(req, res) {
  //console.log(1);
  //console.log('addGrants req.body', JSON.stringify(req.body));
  Role.addGrants(req.body.grants, req.body.ownerData)
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function findAllUserSpaceRole(req, res) {
  Role.findAllUserSpaceRole(req.query.userId, req.query.spaceId)
    .then(respondWithResult(res))
    .catch(handleError(res));
}