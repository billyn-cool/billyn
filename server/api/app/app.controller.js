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
import {App} from '../../sqldb';
import {SpaceApp} from '../../sqldb';
import {Space} from '../../sqldb';
import {Category} from '../../sqldb';
import {Nut} from '../../sqldb';
import {PermitRole} from '../../sqldb';
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

/**
 * get apps according to condition, usually we use 
 * this function to find apps under some space, in case
 * we need provide spaceId as params, format like: {spaceId=xxx},
 * if provide userId, it will navigate to findUserApps
 * @method module:server/api/app.method:index
 * @param req.query {object} condition for finding apps
 * @returns {array} return array of app object, and in each app it
 * contain nuts under app, format like: [{_id:xxx,name:xxx, nuts: [...]}]
 */
export function index(req, res) {

  App.hasMany(Nut, { as: 'nuts' });
  App.belongsTo(Category, { as: 'type' });

  var spaceId = req.query.spaceId || undefined;
  var userId = req.query.userId || undefined;

  if (userId) {
    return findUserApps(req.res);
  }

  if (spaceId) {
    return App.findAll({
      where: req.query,
      include: [
        {
          model: Nut, as: 'nuts',
          where: {
            spaceId: spaceId
          }
        },
        {
          model: Category, as: 'type'
        }
      ]
    })
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  //otherwise, send error message
  return res.status(500).send('please check input!');
}

/**
 * get one app. mention: if want find app by query, 
 * please use index function to find all expected apps and then 
 * get first one from array
 * @method module:server/api/app.method:show
 * @param req.params.id {int} if provide id param, then get by id
 * @returns {object} app object, contain nuts array for app
 */
export function show(req, res) {

  App.belongsTo(Category, { as: 'type' });
  Nut.belongsTo(Category, { as: 'type' });
  App.hasMany(Nut, { as: 'nuts' });

  var appId = req.params.id || undefined;

  if (appId) {
    return App.find({
      where: {
        _id: appId
      },
      include: [
        {
          model: Category, as: 'type'
        },
        {
          model: Nut, as: 'nuts',
          include: [
            {
              model: Category, as: 'type'
            }
          ]
        }
      ]
    })
      .then(handleEntityNotFound(res))
      .then(respondWithResult(res))
      .catch(handleError(res));
  }

  //otherwise, return error
  return res.status(500).send('please check input!');
}

// Updates an existing App in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  App.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a App from the DB
export function destroy(req, res) {
  App.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function joinSpace(req, res) {

  if (req.body.spaceId && req.body.appId) {

    SpaceApp.findOrCreate({
      where: req.body
    })
      .spread(function (entity, created) {
        var data = {
          data: entity,
          created: created
        };
        return Promise.resolve(data);
      })
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  }

}

export function findAppsInSpace(req, res) {

  App.belongsTo(Category, { as: 'type' });
  Nut.belongsTo(App, { as: 'app' });
  Nut.belongsTo(Space, { as: 'space' });
  Nut.belongsTo(Category, { as: 'type' });

  var queryData = req.query;

  App.findAll({
    where: queryData,
    include: {
      model: Category, as: 'type'
    }
  })
    .then(function (rows) {
      //console.log('rows:',rows);
      var apps = [];
      return Promise.map(rows, function (row) {
        //console.log('row:',JSON.stringify(row));
        var appId = row.appId;
        var spaceId = row.spaceId;
        var app = JSON.parse(JSON.stringify(row.app));
        //console.log('app:',app);
        return Nut.findAll({
          where: {
            appId: appId,
            spaceId: spaceId
          },
          include: {
            model: Category, as: 'type'
          }
        }).then(function (rows) {
          app.nuts = rows;
          apps.push(app);
        });
      }).then(function () {
        return Promise.resolve(apps);
      });
    })
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

/**
 * create app
 * @method module:server/api/app.method:create
 * @param req.body {object} must provide spaceId, name as appName, typeId or type
 * @returns {object} return app object
 */
export function create(req, res) {

  //console.log('req.body:', JSON.stringify(req.body));

  var spaceId = req.body.spaceId || undefined;
  var appName = req.body.name || undefined;
  var typeId = req.body.name || undefined;
  var type = req.body.name || undefined;

  if (spaceId && appName && (typeId || type)) {
    return App.add(appData, spaceId)
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  } else {
    return Promise.reject('Please provide spaceId && name && type when create app!');
  }


}

/**
 * create apps in same time
 * @method module:server/api/app.method:bulkCreate
 * @param req.body {object} must provide spaceId and appDataList or appDataCollection
 * format like: {spaceId: xxx, appDataList(appDataCollection): []}
 * @returns {array} return array of app object
 */
export function bulkCreate(req, res) {

  var appDataCollection = req.body.appDataCollection || undefined;
  var appDataList = req.body.appDataList || undefined;
  var spaceId = req.body.spaceId || undefined;

  if (spaceId || (appDataCollection || appDataList)) {
    App.bulkAdd(appDataCollection, spaceId)
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  } else {
    res.status(500).send('please provide spaceId and appDataCollection!');
  }


}
