/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/categorys              ->  index
 * POST    /api/categorys              ->  create
 * GET     /api/categorys/:id          ->  show
 * PUT     /api/categorys/:id          ->  update
 * DELETE  /api/categorys/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import {Category} from '../../sqldb';
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

// Gets a list of Categorys
export function index(req, res) {
	//console.log('Category:',Category);
  Category.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Category from the DB
export function show(req, res) {
  Category.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Category in the DB
export function create(req, res) {
	//console.log('category create 1');
  Category.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Category in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Category.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Category from the DB
export function destroy(req, res) {
  Category.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

export function getChildren(req, res){
	//console.log('req params:',req);
	Category.find({
		_id: req.params.id
	})
	.then(function(category){
		//console.log('category:',category);
		category.getChildren(req.query).then(
			function(results){
				//console.log('results:',results);
				res.status(200).json(results);
			}
		)
	})
	.catch(handleError(res));
}

export function test(req, res){
	
	//console.log('req.body=',req.body);
	/*
  	Thing.create({name: 'root2',info: 'root2 info'})
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
	*/
	
	Category.getTypeRoot(req.body)
	.then(function(typeRoot){
		//res.status(200).json(typeRoot);
		typeRoot.getChild(req.body,true).then(function(child){
			res.status(200).json(child);
			//var isParentOf = typeRoot.isParentOf(child);
			//console.log('isParentOf: ', isParentOf);
			//res.status(200).send(isParentOf);
			//child.getParent().then(function(parent){
				//res.status(200).json(parent);
				//});
		});
	})
	.catch(handleError(res));
	
	/*
	Category.findOrCreate({
		where: {
			name: 'root',
			fullname: 'root'
		},
		defaults: {
			alias: 'root'
		}
	})
	.spread(function(entity,created){
		res.status(200).json(entity);
	})
	.catch(handleError(res));
	*/
	
	/*
	Thing.create({name: 'root1', info: 'root1 info'})
	.then(function(result){
		return Category.findOrCreate({
			where: {name: 'root'}
		})
		.then(function(entity){
			if(entity){
				res.status(200).json(entity);
			}
			else{
				return Category.create({
					name: 'newRoot',
					info: 'newRoot info'
				})
				.then(function(entity2){
					res.status(200).json(entity2);
				});
			}		
		});
	})
	.catch(handleError(res));
	*/
	
	/*
	console.log('req.body=',req.body);
	Category.build().addType(req.body).then(function(type){
		res.status(200).json(type);
	})
	.catch(handleError(res));
	*/
}
