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
import {Circle} from '../../sqldb';
import {Collab} from '../../sqldb';
import {CircleCollab} from '../../sqldb';
import {CircleSpace} from '../../sqldb';
import {Space} from '../../sqldb';
import {Category} from '../../sqldb';
import {CollabRole} from '../../sqldb';
import {PermitRole} from '../../sqldb';
import {Permit} from '../../sqldb';
import {Nut} from '../../sqldb';
import {Role} from '../../sqldb';
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

// Gets a list of Circles
export function index(req, res) {

  //console.log('wah req.query:', JSON.stringify(req.query));

  var spaceId = req.query.spaceId || undefined;
  var whereData = {};

  if (spaceId && spaceId > 0) {
    whereData.spaceId = spaceId;
  }

  Circle.belongsToMany(Space, { as: 'spaces', through: 'CircleSpace' });
  Circle.belongsToMany(Collab, { as: 'collabs', through: 'CircleCollab' });
  Collab.belongsToMany(Role, { through: 'CollabRole', as: 'roles' });
  //Collab.belongsToMany(Role, {through: 'CollabRole', as: 'parentRoles'});

  Circle.findAll(
    {
      where: whereData,
      include: [
        {
          model: Space, as: 'spaces'
        },
        {
          model: Collab, as: 'collabs',
          include: [
            {
              model: Role, as: 'roles',
            }
          ]
        },
      ]
    }
  )
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function findUserCircles(req, res) {
  var userId = req.query.userId;
  var spaceId = req.query.spaceId;

  Circle.belongsTo(Category, { as: 'type' });
  Collab.belongsTo(Category, { as: 'type' });
  Circle.hasMany(CircleCollab, { foreignKey: 'circleId', as: 'circleCollabs' });
  CollabRole.belongsTo(Collab, { as: 'collab' });
  CollabRole.belongsTo(Role, { as: 'role' });
  Role.hasMany(PermitRole, { foreignKey: 'roleId', as: 'PermitNuts' });
  PermitRole.belongsTo(Permit, { as: 'permit' });
  PermitRole.belongsTo(Role, { as: 'role' });
  PermitRole.belongsTo(Nut, { foreignKey: 'ownerId', as: 'nut' });

  var guestRoleList;
  var collabIdList;
  var collabRoleList;
  var circleList;

  UserRole.findAll({
    where: {
      userId: userId,
      spaceId: spaceId
    }
  }).then(function (userRoles) {
    //console.log('userRoles', JSON.stringify(userRoles));
    var roleIdList = [];
    userRoles.forEach(function (userRole) {
      //console.log('userRole',JSON.stringify(userRole));
      if (roleIdList.indexOf(userRole.roleId) === -1) {
        roleIdList.push(userRole.roleId);
      }
      //console.log('2');
    });
    //console.log('roleIdList', JSON.stringify(roleIdList));
    Collab.belongsToMany(Role, { through: 'CollabRole', foreignKey: 'collabId', otherKey: 'roleId' });
    //console.log(1);
    return Collab.findAll(
      {//first get collabs as childRole
        include: [
          {
            model: Role,
            where: {
              $or: {
                _id: roleIdList
              }
            },
            through: {
              where: {
                roleType: 'child'
              }
            }
          }
        ]
      }).then(function (collabs) {
        console.log('collabs:', JSON.stringify(collabs));
        var collabIdList = [];
        collabs.forEach(function (o) {
          collabIdList.push(o._id);
        })
        Role.belongsToMany(Collab, { through: 'CollabRole', foreignKey: 'roleId', otherKey: 'collabId' });
        Role.hasMany(PermitRole, { foreignKey: 'roleId', as: 'nutPermits' });
        PermitRole.belongsTo(Permit, { as: 'permit' });
        PermitRole.belongsTo(Role, { as: 'role' });
        PermitRole.belongsTo(Nut, { foreignKey: 'ownerId', as: 'nut' });
        //find parent roles through collabs
        return Role.findAll({
          include: [
            {
              model: Collab,
              include: [
                {
                  model: Role,
                }
              ],
              where: {
                $or: {
                  _id: collabIdList
                }
              },
              through: {
                where: {
                  roleType: 'parent'
                }
              }
            },
            {
              model: PermitRole, as: 'nutPermits',
              include: [
                {
                  model: Permit, as: 'permit'
                },
                {
                  model: Nut, as: 'nut'
                }
              ]
            }
          ]
        })
      }).then(function (parentRoles) {
        var circles = {};
        parentRoles.forEach(function (role) {
          var collabs = role.collabs;
          collabs.forEach(function (collab) {
            var circle = collab.circle;
            circles[circle._id] = circle;
            if (!circle.collabs) {
              circle.collabs = {};
            }
            circle.collabs[collab._id] = collab;
            if (!collab.parentRoles) {
              collab.parentRoles = {};
            }
            collab.parentRoles[role._id] = role;
            if (!collab.nutPermits) {
              collab.nutPermits = {};
            }
            role.nutPermits.forEach(function (o) {
              collab.nutPermits[o._id] = o;
            })
          })
        });
        return Promise.resolve(circles);
      });
  })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

//must provide userId, spaceId, circleId
export function findUserCircleNuts(req, res) {

  var userId = req.query.userId;
  var circleId = req.query.circleId;
  var spaceId = req.query.spaceId;

}

export function findCirclesForJoin(req, res) {

  Circle.hasMany(CircleSpace);
  Circle.belongsToMany(Space, { as: 'spaces', through: 'CircleSpace' });
  Space.hasMany(Collab, { as: 'collabs' });
  CircleCollab.belongsTo(Circle);

  var spaceId = req.query.spaceId || undefined;

  if (spaceId) {

    Circle.findAll(
      {
        where: {
          spaceId: { $ne: spaceId } //not include created circle for spaceId
        },
        include: [
          {
            model: CircleSpace,
            where: { spaceId: spaceId } //joined circle by spaceId
          },
        ]
      },
    ).then(function (joinedCircles) {

      //console.log('joinedCircles:', JSON.stringify(joinedCircles));

      var joinedList = [];

      joinedCircles.forEach(function (jc) {
        joinedList.push(jc._id);
      })

      var whereData = {
        spaceId: { $ne: spaceId }, //not include circles under spaceId
      }

      if (joinedList.length > 0) {
        whereData._id = { $notIn: joinedList } //exclude joined circles
      }

      return Circle.findAll(
        {
          where: whereData
        }
      )
    })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

}

export function findJoinedCircles(req, res) {

  var spaceId = req.query.spaceId || undefined;

  Circle.hasMany(CircleSpace);
  Circle.belongsToMany(Space, { as: 'spaces', through: 'CircleSpace' });
  Circle.belongsToMany(Collab, { as: 'collabs', through: 'CircleCollab' });
  //Collab.belongsTo(Space, {as: 'collabs', foreignKey: 'spaceId'});
  //Space.hasMany(Collab, { as: 'collabs', foreignKey: 'spaceId' });
  //CircleCollab.belongsTo(Collab);


  if (spaceId && spaceId > 0) {

    Circle.findAll(
      {
        where: {
          spaceId: { $ne: spaceId } //not include created circle for spaceId
        },
        include: [
          {
            model: CircleSpace,
            where: {
              spaceId: spaceId
            }
          },
          {
            model: Space, as: 'spaces',
          },
          {
            model: Collab, as: 'collabs'
          }
        ]
      },
    )
      .then(respondWithResult(res))
      .catch(handleError(res));

  } else {
    res.status(500).send('please check input!');
  }
}

// Gets a single Nut from the DB
export function show(req, res) {

  var circleId = req.params.id || undefined;

  Circle.belongsTo(Category, { as: 'type' });
  Circle.belongsTo(Space, { as: 'space' });
  Circle.belongsToMany(Space, { as: 'spaces', through: 'CircleSpace' });
  Circle.belongsToMany(Collab, { through: 'CircleCollab', as: 'collabs' });
  Collab.belongsToMany(Role, { through: 'CollabRole', as: 'roles' });
  //Collab.belongsToMany(Role, {through: 'CollabRole', as: 'parentRoles'});

  if (circleId && circleId > 0) {
    Circle.find({
      where: { _id: circleId },
      include: [
        {
          model: Category, as: 'type'
        },
        {
          model: Space, as: 'space'
        },
        {
          model: Collab, as: 'collabs',
          include: [
            {
              model: Role, as: 'roles'
            },
          ]
        },
        {
          model: Space, as: 'spaces'
        }
      ]
    })
      .then(handleEntityNotFound(res))
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    res.status(500).send('please check input!');
  }

}

// Creates a new Circle in the DB
/**
 * post data: {
 * name:xxs
 * alias: xxx,
 * spaceId: xxx
 * type: xxxx [typeId:xxx] 
 * }
 * if provide type, will create type by default
 */
export function create(req, res) {

  Circle.belongsTo(Category, { as: 'type' });
  Circle.belongsTo(Space, { as: 'space' });
  var circleData = req.body;
  var typeData, spaceId, typeId;
  var theCircle, defaultCollabs;
  //console.log('circleData:', JSON.stringify(circleData));
  if (circleData.type && circleData.type.defaultCollabs) {
    defaultCollabs = circleData.type.defaultCollabs;
  }
  for (var key in circleData) {
    if (key.toLowerCase() === 'type' || key.toLowerCase() === 'typename') {
      typeData = circleData[key];
      delete circleData[key];
    }
    if (key.toLowerCase() === 'spaceid') {
      spaceId = circleData[key];
    }
    if (key.toLowerCase() === 'typeid') {
      typeId = circleData[key];
    }
  }

  if (circleData.name) {
    var circleName = circleData.name;
  		// delete circleData.name;
  }

  if (!typeId && !typeData) {
    typeData = {
      name: "normal",
      alias: "normal circle"
    };
  }

  //console.log('spaceId',spaceId);
  //console.log('circleName',circleName);

  if (!spaceId || !circleName) {
    return res.status(500).send('please check input!');
  }

  if (typeData && circleName) {
    //console.log('create circle typeName:',typeName);
    Circle.addType(typeData).then(function (type) {
      //console.log('type:',JSON.stringify(type));
      circleData.typeId = type._id;
      var whereData = {
        name: circleName,
        spaceId: spaceId
      }
      Circle.findOrCreate({
        where: whereData,
        defaults: circleData
      })
        .spread(function (circle, created) {
          //console.log('circle:',JSON.stringify(circle));
          theCircle = circle;
          //console.log('circleData 2:',JSON.stringify(circleData));
          //console.log('defaultCollabs:',JSON.stringify(defaultCollabs));
          if (defaultCollabs) {
            //var defaultCollabs = circleData.defaultCollabs;
            //console.log('defaultCollabs:',JSON.stringify(defaultCollabs));
            return Collab.bulkAdd(defaultCollabs, { spaceId: spaceId }).then(function (collabs) {
              //console.log('collbs:', JSON.stringify(collabs));
              return Promise.each(collabs, function (collab) {
                return CircleCollab.findOrCreate({
                  where: {
                    circleId: circle._id,
                    collabId: collab._id
                  },
                  defaults: {}
                });
              });
            });
          } else {
            return Promise.resolve(null);
          }
        }).then(function () {
          //console.log('after add collabs to circle');
          Circle.belongsTo(Category, { as: 'type' });
          Circle.belongsTo(Space, { as: 'space' });
          Circle.hasMany(CircleCollab, { foreignKey: 'circleId', as: 'circleCollabs' });
          Collab.belongsTo(Category, { as: 'type' });
          Collab.hasMany(CollabRole, { foreignKey: 'collabId', as: 'collabRoles' });
          CircleCollab.belongsTo(Collab, { as: 'collab' });
          //that.hasMany(CollabRole,{foreignKey: 'collabId', as:'childRoles'});
          CollabRole.belongsTo(Role, { as: 'role' })
          //console.log('circle:', JSON.stringify(theCircle));
          Circle.find({
            where: { _id: theCircle._id },
            include: [
              {
                model: Category, as: 'type'
              }, {
                model: Space, as: 'space'
              },
              {
                model: CircleCollab, as: 'circleCollabs',
                include: {
                  model: Collab, as: 'collab',
                  include: [
                    {
                      model: Category, as: 'type'
                    },
                    {
                      model: CollabRole, as: 'collabRoles',
                      include: [
                        {
                          model: Role, as: 'role'
                        }
                      ]
                    }
                  ]
                }
              }
            ]
          })
            .then(handleEntityNotFound(res))
            .then(respondWithResult(res))
            .catch(handleError(res));
        })
    });
  } else {
    //console.log('not type:', JSON.stringify(circleData));
    var whereData = {
      name: circleName,
      spaceId: spaceId
    }
    Circle.findOrCreate({
      where: whereData,
      defaults: circleData
    })
      .spread(function (circle, created) {
        //console.log('2 not type:', JSON.stringify(circle));
        return Circle.find({
          where: { _id: circle._id },
          include: [{
            model: Category, as: 'type'
          },
            {
              model: Space, as: 'space'
            }
          ]
        })
      })
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  }
}

// Updates an existing Circle in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Circle.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Circle from the DB
export function destroy(req, res) {
  Circle.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function addType(req, res) {

  Circle.addType(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));

}

/**
 * 
 */
export function addSpace(req, res) {

  var spaceId = req.query.spaceId || req.body.spaceId || undefined;
  var circleId = req.query.circleId || req.body.circleId || undefined;
  var status = req.query.joinStatus || req.body.joinStatus || 'applying';

  //console.log('spaceId:', spaceId);
  //console.log('req.body=', JSON.stringify(req.body));

  if (spaceId && circleId && status) {

    CircleSpace.findOrCreate(
      {
        where: {
          spaceId: spaceId,
          circleId: circleId
        },
        defaults: {
          joinStatus: status
        }
      }
    ).spread(function (entity, created) {
      if (entity.joinStatus === status) {
        return Promise.resolve(entity);
      } else {
        entity.joinStatus = status;
        return entity.save();
      }
    })
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  } else {
    res.status(500).send('please check input!');
  }

}

/**
 * add collab into circle
 */
export function addCircleCollab(req, res) {

  //console.log('req.body:', JSON.stringify(req.body));

  var collabId = req.body.collabId || undefined;
  var circleId = req.body.circleId || undefined;
  var status = req.body.joinStatus || 'applying';

  CircleCollab.belongsTo(Collab, { as: 'collab' });

  if (collabId && circleId && status) {

    CircleCollab.findOrCreate(
      {
        where: {
          collabId: collabId,
          circleId: circleId
        },
        include: [
          {
            model: Collab, as: 'collab'
          }
        ],
        defaults: {
          joinStatus: status
        }
      }
    ).spread(function (entity, created) {
      //console.log('entity:',JSON.stringify(entity));
      //console.log('created:',created);
      if (!created) {
        entity.joinStatus = status;
        var oCollab = JSON.stringify(entity.collab);
        return entity.save();
      } else {
        return Promise.resolve(entity);
      }
    })
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  } else {
    res.status(500).send('please check input!');
  }


}

/**
 * this function return all spaces in circle with collabs
 * circle manager will use these data to perform tasks like:
 * 1)approve/reject apply for join
 * 2)approve/reject apply for join collab
 */
export function findCircleSpacesForManage(req, res) {

  var spaceId = req.query.spaceId || undefined;
  var circleId = req.query.circleId || undefined;

  Space.hasMany(CircleSpace);
  Space.hasMany(Collab, { as: 'collabs' });
  Collab.hasMany(CircleCollab);

  if (spaceId && spaceId > 0 && circleId && circleId > 0) {

    Space.findAll(
      {
        include: [
          {
            model: CircleSpace,
            where: {
              circleId: circleId
            }
          },
          {
            model: Collab, as: 'collabs',
            include: [
              {
                model: CircleCollab,
                where: {
                  circleId: circleId //only list collabs belongsTo current circle
                }
              }
            ]
          }
        ]
      }
    )
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  } else {
    res.status(500).send('please check input!');
  }
}

/**
 * This function use to find all user circles after user join
 * some collabs
 * @returns array return circles array, in each circle has many 
 * spaces and each space has many collabs which is joined by 
 * user, and also return parent roles for each collab, which will
 * be used to find nut permits for user
 */
export function findAllUserCircleAsMember(req, res) {
  var spaceId = req.query.spaceId || undefined;
  var userId = req.query.userId || undefined;
  var circleId = req.query.circleId || undefined;

  Circle.belongsToMany(Space, { through: CircleSpace, as: 'spaces' });
  Circle.belongsToMany(Collab, { through: CircleCollab, as: 'collabs' });
  Space.hasMany(Collab, { as: 'collabs' });
  Collab.hasMany(CollabRole);
  Role.hasMany(CollabRole);
  //Collab.belongsTo
  Collab.belongsToMany(Role, { through: CollabRole, as: 'parentRoles', foreignKey: 'collabId', otherKey: 'roleId' });
  Role.hasMany(PermitRole, { as: 'nutPermits' });
  PermitRole.belongsTo(Permit, { as: 'permit' });
  PermitRole.belongsTo(Nut, { foreignKey: 'ownerId', as: 'nut' });

  if (spaceId && userId) {

    Role.findAllUserSpaceRole(userId, spaceId)
      .then(function (roles) {
        var roleIdList = [];
        roles.forEach(function (r) {
          roleIdList.push(r._id);
        })

        //console.log('roleIdList', roleIdList);

        var whereData = {};
        if (circleId) {
          whereData._id = circleId;
        }

        return Circle.findAll(
          {
            where: whereData,
            include: [
              {
                model: Space, as: 'spaces',
                include: [
                  {
                    model: Collab, as: 'collabs',
                    include: [
                      {
                        model: CollabRole,
                        where: {
                          roleType: 'child',
                          roleId: {
                            $in: roleIdList
                          }
                        }
                      },
                      {
                        model: Role, as: 'parentRoles',
                        include: [
                          {
                            model: CollabRole,
                            where: {
                              roleType: 'parent'
                            }
                          },
                          {
                            model: PermitRole, as: 'nutPermits',
                            where: {
                              owner: 'nut'
                            },
                            include: [
                              {
                                model: Nut, as: 'nut'
                              },
                              {
                                model: Permit, as: 'permit'
                              }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                model: Collab, as: 'collabs',
                include: [
                  {
                    model: CollabRole,
                    where: {
                      roleType: 'child',
                      roleId: {
                        $in: roleIdList
                      }
                    }
                  },
                  {
                    model: Role, as: 'parentRoles',
                    include: [
                      {
                        model: CollabRole,
                        where: {
                          roleType: 'parent'
                        }
                      },
                      {
                        model: PermitRole, as: 'nutPermits',
                        where: {
                          owner: 'nut'
                        },
                        include: [
                          {
                            model: Nut, as: 'nut'
                          },
                          {
                            model: Permit, as: 'permit'
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        )
          .then(respondWithResult(res, 201))
          .catch(handleError(res));
      })



  } else {
    res.status(500).send('please provide spaceId & userId!');
  }
}
