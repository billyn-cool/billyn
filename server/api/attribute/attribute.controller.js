/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/attributes              ->  index
 * POST    /api/attributes              ->  create
 * GET     /api/attributes/:id          ->  show
 * PUT     /api/attributes/:id          ->  update
 * DELETE  /api/attributes/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import {Attribute} from '../../sqldb';

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

// Gets a list of Attributes
export function index(req, res) {
  Attribute.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Attribute from the DB
export function show(req, res) {
  Attribute.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Attribute in the DB
export function create(req, res) {
  Attribute.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Attribute in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Attribute.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Attribute from the DB
export function destroy(req, res) {
  Attribute.find({
      where: {
        _id: req.params.id
      }
    })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

//常用函数
export function getAttribute(req, res) {
  var attrData = req.body;
  Attribute.find({
      include: [{all: true}],
      where: attrData
    })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

export function addAttribute(req, res) {
  var attrData = req.body;
  Attribute.addAttribute(attrData)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function addAttributes(req, res) {
  var attrData = req.body;
  Attribute.addAttributes(attrData)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

export function getAttributes(req, res) {
}

