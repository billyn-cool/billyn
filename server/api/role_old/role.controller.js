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
import {Thing} from '../../sqldb';

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

// Gets a list of Roles
/*
export function index(req, res) {
	//console.log('Role:',Role);
  Role.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}
*/

// Gets a single Role from the DB
export function getRole(req, res) {
	var whereData = {};
	if(req.params.id){
		whereData._id = req.params.id;
	}
	if(req.params.name){
		whereData.fullname = 'root.' + name;
	}
  Role.find({
    where: whereData
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Role in the DB under space
export function addRole(req, res) {

  req.body.spaceId = req.params.spaceId;
  Role.addRole(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Role in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Role.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
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

export function getSpaceRoles(req, res){
	
	Role.findAll({
		where: {
			spaceId: req.params.spaceId
		}
	}).then(respondWithResult(res));
	.catch(handleError(res));
	
}
