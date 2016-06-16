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

// Gets a list of Apps
export function index(req, res) {
  App.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single App from the DB
//if url like : /api/apps/:id?spaceId=sId
//will return nuts for space too
export function show(req, res) {

  App.belongsTo(Category, { as: 'type' });
  Nut.belongsTo(Category, { as: 'type' });

  var param = req.params.id;

  if (param && param.toLowerCase() === 'space') {
    return findAppsInSpace(req, res);
  }

  var spaceId;
  if (req.query) {
    spaceId = req.query.spaceId ? req.query.spaceId : undefined;
  }

  var whereData = {};
  if (req.params.id) {
    whereData._id = req.params.id;
  }
  if (req.query.name) {
    whereData.name = req.query.name;
  }

  App.find({
    where: whereData,
    include: {
      model: Category, as: 'type'
    }
  }).then(function (app) {
    if (spaceId !== undefined) {
      return Nut.findAll({
        where: {
          appId: app._id,
          spaceId: spaceId
        },
        include: {
          model: Category, as: 'type'
        }
      }).then(function (rows) {
        app = JSON.parse(JSON.stringify(app));
        app.nuts = rows;
        return Promise.resolve(app);
      });
    } else {
      return Promise.resolve(app);
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single App from the DB
export function getAppByName(req, res) {
  var param = req.params.name;

  App.find({
    where: {
      name: req.params.name
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new App in the DB, it will use findOrCreate
/*
export function create(req, res) {
    //console.log('App create req.body:', JSON.stringify(req.body));
    var appData = req.body;
    var typeName;
    for(var key in appData){
     if(key.toLowerCase() === 'type' || key.toLowerCase() === 'typename'){
      typeName = appData[key];
      delete appData[key]; 
    }
  }

  if(appData.name){
    var appName = appData.name;
    delete appData.name;
  }

	//console.log('create app appData:',JSON.stringify(appData));

  if(typeName && appName){
   App.addType(typeName).then(function(type){
    appData.typeId = type._id;
    App.findOrCreate({
     where: {name: appName},
     defaults:appData
   }).spread(function(result,created){
     var data = {};
     data.data = result;
     data.created = created;
     return Promise.resolve(data);
   })
   .then(respondWithResult(res, 201))
   .catch(handleError(res));
 })
 } else {
   App.findOrCreate({
    where: {name: appName},
    defaults:appData
  })
		  //because response only accept object, so have to handle it
		  //before send out
		  .spread(function(result,created){
        var data = {};
        data.data = result;
        data.created = created;
        return Promise.resolve(data);
      })
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
    } 
  }*/

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
    //var spaceId = req.body.spaceId;
    //var appId = req.body.appId;

		/*
		Space.findById(spaceId).then(function(space){
			console.log('joinSpace space:', JSON.stingify(space));
			return App.findById(appId).then(function(app){
				console.log('joinSpace app:', JSON.stingify(app));
				return space.addApp(app);
			})
		})*/
    SpaceApp.findOrCreate({
      where: req.body
    })
      .spread(function (result, created) {
        var data = {
          data: result,
          created: created
        };

        return Promise.resolve(data);
      })
      .then(respondWithResult(res, 201))
      .catch(handleError(res));
  }

}

//get app by id or by name
export function getApp(req, res) {

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

export function create(req, res) {

  //console.log('req.body:', JSON.stringify(req.body));

  var appData = req.body;
  var spaceId = appData.spaceId;
  var app;
  var typeId;

  if (!spaceId) {
    return Promise.reject('Please provide spaceId in create app!');
  }

  //console.log('0');
  /*
  new Promise(function(resolve, reject){

    //console.log('1 appData:', JSON.stringify(appData));

    var typeName;

    for(var key in appData){
      if(key.toLowerCase()==='type'||key.toLowerCase()==='typename'){
        typeName = appData[key];
      }
    }

    if ( appData.typeId ){
      return resolve(appData.typeId);
    } else if (typeName) {
      return App.addType({
        name: typeName,
        spaceId: spaceId
      }).then(function(type){
        //console.log('after get type:', JSON.stringify(type));
        return resolve(type._id);
      });
    } else {
      return reject('fail to get typeId in create app!');
    }

  }).then(function(typeId){

    //console.log('2: typeId:',typeId);

    var appName = appData.name;
    appData.typeId = typeId;

    if ( !appName ){
      return Promise.reject('fail to find appName in create app!');
    } else {
      appData.alias = appData.alias || appName;

      //console.log("createApp appData before created app:", JSON.stringify(appData));

      App.belongsTo(Category, {as: 'type'});

      return App.findOrCreate({
        where: {
          name: appName,
          spaceId: spaceId
        },
        defaults: appData
      }).spread(function(result,created){
        //console.log('created:',created);
        //console.log('result:',JSON.stringify(result));
        if (created){
          return Promise.resolve(result);
        } else {
          //console.log('not create app result:',result);
          return new Promise(function(resolve,reject){
            return resolve(result);
          })
            .then(respondWithResult(res, 201))
            .catch(handleError(res));
          //statusCode = statusCode || 200;
          //res.status(statusCode).json(result);
          //return Promise.reject('app exist already!');
        }       
      });
    }
  }).then(function(newApp){
    app = newApp;
    var nuts;
    var type;
    if(appData.nuts){
      nuts = appData.nuts;
      type = 'nut.normal';
    }
    if(appData.cores){
      nuts = appData.cores;
      type = 'nut.core';
    }

    if( !nuts){
      return Promise.reject('fail to find nuts data in create app!');
    }

    var nutArray = [];

    //console.log('nuts:', JSON.stringify(nuts));

    for( var key in nuts ){
      var nutData = nuts[key];
      var nut = {};
      nut.name = key;
      nut.alias = nutData.alias || key;
      nut.description = nutData.description || key;
      nut.type = nutData.type || type;
      nut.spaceId = spaceId,
      nut.appId = app._id;
      nutArray.push(nut);
    }

    return Nut.addBulkNut(nutArray);

  })
  .then(function(){
    //console.log('000');
    return Nut.findAll({
      where: {
        spaceId: spaceId,
        appId: app._id
      }
    }).then(function(nuts){
      //add nut permits
      var permitRoleList = [];
      //console.log('nuts:',JSON.stringify(nuts));
      //console.log('appData:',JSON.stringify(appData));
      nuts.forEach(function(nut){
        var nutName = nut.name;
        var appName = app.name;
        var grants;
        if(appData['cores'] && appData['cores'][nutName]['grants']){
          grants = appData['cores'][nutName]['grants'];
        }
        if(appData['nuts'] && appData['nuts'][nutName]['grants']){
          grants = appData['nuts'][nutName]['grants'];
        }
        //console.log('grants:',JSON.stringify(grants));
        for(var key in grants){
          var permits = grants[key];
          var permitList = [];
          //console.log('typeof permits:',typeof permits);
          if(typeof permits === 'object'){
            permitList = permits;
          }
          if(typeof permits === 'string'){
            permitList = permits.split(",");
          }
          permitList.forEach(function(permit){
            var oPermit = {};
            oPermit.role = key;
            oPermit.permit = permit;
            oPermit.spaceId = spaceId;
            oPermit.owner = 'nut';
            oPermit.ownerId = nut._id;
            permitRoleList.push(oPermit);
          });         
        }
      });

      //console.log('permitRoleList:', JSON.stringify(permitRoleList));
      return PermitRole.addBulkPermitRole(permitRoleList);
    })
  }).then(function(){
    App.belongsTo(Category,{as: 'type'});
    return App.find({
      where: {
        _id: app._id
      },
      include: [{
        model: Category, as: 'type'
      }]
    });
  })*/
  App.add(appData, spaceId)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function bulkCreate(req, res) {

  var appDataCollection = req.body.appDataCollection;
  var spaceId = req.body.spaceId;

  if (!spaceId || !appDataCollection) {
    res.status(500).send('please provide spaceId and appDataCollection!');
  }

  App.bulkAdd(appDataCollection, spaceId)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}
