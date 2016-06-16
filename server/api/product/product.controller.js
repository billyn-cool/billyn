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

// Gets a list of Nuts
export function index(req, res) {
  Nut.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Nut from the DB
export function show(req, res) {
  Nut.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Nut in the DB
export function create(req, res) {
    //console.log('Nut create req.body:', JSON.stringify(req.body));
    var nutData = req.body;
    var typeName;
    for(var key in nutData){
  	  if(key.toLowerCase() === 'type' || key.toLowerCase() === 'typename'){
  		  typeName = nutData[key];
  		  delete nutData[key]; 
  	  }
    }
	
	if(nutData.name){
		var nutName = nutData.name;
		delete nutData.name;
	}
  
    if(typeName && nutName){
		console.log('create nut typeName:',typeName);
  	  Nut.addType(typeName).then(function(type){
  		  nutData.typeId = type._id;
  	      Nut.findOrCreate({
			  where: {name: nutName},
			  defaults:nutData})
  	      .then(respondWithResult(res, 201))
  	      .catch(handleError(res));
  	  })
    } else {
	      Nut.findOrCreate({
		  		where: {name: nutName},
		  		defaults:nutData})
	      	.then(respondWithResult(res, 201))
	      	.catch(handleError(res));
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

export function findOrCreate(req, res){
	
}
