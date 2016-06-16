var Q = require('q');
var _ = require('lodash');
var Promise = require('bluebird');
//import * as db from './index';

function TreeTable(context) {
	
	this.context = context;

	this.getChildren = function(parentObj, childData) {

		var spaceId = parentObj.spaceId;
		var appId = appId;
		var fullname = parentObj.fullname;
		var thisId = parentObj._id;
		//console.log('parentObj:',JSON.stringify(parentObj));
		var Model = parentObj.Model;
		//console.log('Model:',Model);

		var mode = 'child';
		if (typeof childData === 'object') {
			if (childData.hasOwnProperty('mode')) {
				mode = childData.mode;
			}
		}
		if(typeof childData === 'string'){
			mode = childData;
		}

		//console.log('mode:', mode);

		if (mode.toLowerCase() === 'child') {
			return Model.findAll({
				where: {
					parentId: thisId
				}
			});
		}

		//console.log('parentObj:',parentObj);
		//console.log('fullname:', fullname);

		return Model.findAll({
			where: {
				spaceId: spaceId,
				//appId: appId,
				fullname: {
					$like: fullname + '.%'
				}
			}
		}).then(function(models) {

			//console.log('models length:', models.length);
			//console.log('models mode:', mode);

			if(models.length === 0 ){
				//console.log('models:', models);
				return Promise.resolve(models);
			}			

			if (mode.toLowerCase() === 'all') {
				return Promise.resolve(models);
			}
			if (mode.toLowerCase() === 'leaf') {
				var fNames = [];
				var retModels = [].concat(models);
				//console.log('retModels 1:', JSON.stringify(retModels));
				models.forEach(function(model) {
					fNames.push(model.fullname);
				});
				//console.log('fNames 1:', fNames);
				models.forEach(function(model, index) {
					var fName = model.fullname;
					fNames.forEach(function(fn) {
						if (fName.indexOf(fn + '.') === 0) {
							//console.log('fn:', fn);
							//console.log('fName:', fName);
							//console.log('index:', index);
							retModels.forEach(function(m,index){
								if(m.fullname === fn){
									retModels.splice(index,1);
								}
							});
							//retModels.splice(retModels.indexOf(model), 1);
						}
					});
				});
				//console.log('retModels 5:', JSON.stringify(retModels));
				return Promise.resolve(retModels);
				//return retModels;
			}
		});
	}

	this.getRoot = function(Model) {

		return Model.findOrCreate({
			where: {
				name: 'root',
				fullname: 'root'
			},
			defaults: {
				alias: 'root'
			}
		})
			.spread(function(entity, created) {
				return Promise.resolve(entity);
			});

	}

	this.addChild = function(parentObj, childData) {

		var childName;
		var owner;
		var ownerId;
		var spaceId;
		var appId;
		var Model;

		if (typeof parentObj === 'object') {
			Model = parentObj.Model;
			for (var key in parentObj) {

				if (key.toLowerCase() === 'owner') {
					owner = parentObj[key];
					//delete parentObj[key];
				}
				if (key.toLowerCase() === 'ownerid') {
					ownerId = parentObj[key];
					//delete parentObj[key];
				}
				if (key.toLowerCase() === 'spaceid') {
					spaceId = parentObj[key];
					//delete parentObj[key];
				}
				if (key.toLowerCase() === 'appid') {
					appId = parentObj[key];
					//delete parentObj[key];
				}
			}
		}

		if (typeof childData === 'string') {
			childName = childData;
			childData = {};
			childData.name = childName;
		}

		if (typeof childData === 'object') {
			//console.log('childData 2: ', JSON.stringify(childData));
			for (var key in childData) {
				if (key.toLowerCase() === 'name' || key.toLowerCase() === 'childname') {
					childName = childData[key];
					delete childData[key];
				}
				if (key.toLowerCase() === 'owner') {
					owner = childData[key];
					delete childData[key];
				}
				if (key.toLowerCase() === 'ownerid') {
					ownerId = childData[key];
					delete childData[key];
				}
				if (key.toLowerCase() === 'spaceid') {
					spaceId = childData[key];
					delete childData[key];
				}
				if (key.toLowerCase() === 'appid') {
					appId = childData[key];
					delete childData[key];
				}
			}
		}
		//console.log('childName:',childName);

		var childContext = {};

		if (owner) {
			childContext.owner = owner;
		}
		if (ownerId && ownerId !== -1) {
			childContext.ownerId = ownerId;
		}
		if (spaceId && spaceId !== -1) {
			childContext.spaceId = spaceId;
		}
		if (appId && appId !== -1) {
			childContext.appId = appId;
		}
		
		//console.log('3 parentObj:', parentObj);
		//console.log('3 Model:', Model);
		//console.log('3 childName:', childName);

		if (parentObj && Model && childName) {
			//console.log('4');
			var names = childName.split('.');

			//console.log('names:',names);
			var parentId = parentObj._id;
			var fullname = parentObj.fullname;
			var finalChild;
			var i = 0;
			var length = names.length;
			return Promise.reduce(names, function(finalChild, tName) {
				//childData.alias = childData.alias || tName;
				childContext.name = tName;
				childContext.fullname = fullname + '.' + tName;
				childContext.parentId = parentId;
				//console.log('name: ',tName);
				//console.log('fullName: ',fullname);
				//console.log('parentId: ',parentId);
				//console.log('childContext',JSON.stringify(childContext));
				var defaults = {};
				if(i++ === length -1){
					childData.alias = childData.alias || childName;
					defaults = childData;
				}
				//console.log('i:length:defaults:childData***',i + ';'+length+';'+JSON.stringify(defaults)+JSON.stringify(childData));
				return Model.findOrCreate({
					where: childContext,
					defaults: defaults
				})
					.spread(function(theChild, created) {
						parentId = theChild._id;
						fullname = theChild.fullname;
						return finalChild = theChild;
						//console.log('finalChild:', finalChild);
						//Promise.resolve(finalChild);
					});
			},0)
				.then(function(finalChild) {
					//console.log('promise.map finalChild: ',finalChild);
					return Promise.resolve(finalChild);
				});

		}

		//otherwise, return error
		return Promise.reject(new Error('fail to add child!'));
	}

	this.getChild = function(parentObj, childData) {

		var childContext = {};
		var childName;
		
		//console.log('parentObj:', JSON.stringify(parentObj));

		if (typeof parentObj === 'object') {
			Model = parentObj.Model;
			for (var key in parentObj) {

				if (key.toLowerCase() === 'owner') {
					childContext.owner = parentObj[key];
					//delete parentObj[key];
				}
				if (key.toLowerCase() === 'ownerid') {
					childContext.ownerId = parentObj[key];
					//delete parentObj[key];
				}
				if (key.toLowerCase() === 'spaceid') {
					childContext.spaceId = parentObj[key];
					//delete parentObj[key];
				}
				if (key.toLowerCase() === 'appid') {
					childContext.appId = parentObj[key];
					//delete parentObj[key];
				}
			}

			if (typeof childData === 'string') {
				//console.log('string childData:', childData);
				childContext.name = childData.slice(childData.lastIndexOf('.')+1);
				childContext.fullname = parentObj.fullname + "." + childData;
				//console.log('getChild childContext 2: ', JSON.stringify(childContext));
			}

			if (typeof childData === 'object') {
				
				//console.log('getChild childData: ', JSON.stringify(childData));

				for (var key in childData) {
					if (key.toLowerCase() === 'name' || key.toLowerCase() === 'childname') {
						childName = childData[key];
						//childContext.name = childName;
						childContext.fullname = parentObj.fullname + '.' + childName;
						//delete childData[key];
					}
					if (key.toLowerCase() === 'owner') {
						childContext.owner = childData[key];
						//delete childData[key];
					}
					if (key.toLowerCase() === 'ownerid') {
						childContext.ownerId = childData[key];
						//delete childData[key];
					}
					if (key.toLowerCase() === 'spaceid') {
						childContext.spaceId = childData[key];
						//delete childData[key];
					}
					if (key.toLowerCase() === 'appid') {
						childContext.appId = childData[key];
						//delete childData[key];
					}
				}
			}

			var Model = parentObj.Model;
			//console.log('Model:',Model);
			
			//console.log('getChild childContext: ', JSON.stringify(childContext));

			return Model.find({
				where: childContext
			});
		}
	}

	this.getParent = function(childObj, recursive) {

		var parentContext = {};
		var Model;

		if (typeof childObj === 'object') {
			Model = childObj.Model;
			parentContext._id = childObj.parentId;
			for (var key in childObj) {

				if (key.toLowerCase() === 'owner') {
					parentContext.owner = childObj[key];
					//delete childData[key];
				}
				if (key.toLowerCase() === 'ownerid') {
					parentContext.ownerId = childObj[key];
					//delete childData[key];
				}
				if (key.toLowerCase() === 'spaceid') {
					parentContext.spaceId = childObj[key];
					//delete childData[key];
				}
				if (key.toLowerCase() === 'appid') {
					parentContext.appId = childObj[key];
					//delete childData[key];
				}
			}
		}

		if (Model && !_.isEmpty(parentContext)) {

			if (parentContext._id === 1) {
				return this.getRoot(Model);
			} else {
				if (recursive === true) { //get all parents
					var fullname = childObj.fullname;
					var pfConditions = [];
					var names = fullname.split('.');
					var pfname;
					names.forEach(function(name) {
						if (pfname) {
							pfname += '.' + name;
						} else {
							pfname = name;
						}
						pfCondition.push({
							fullname: pfname
						});
					});
					parentContext[$or] = pfCondition;
					console.log('parentContext: ', JSON.stringify(parentContext));
					return Model.findAll({
						where: parentContext
					});
				} else {
					return Model.findById(parentContext._id);
				}
			}
		}

		Promise.reject(new Error('fail to get parent!'));
	}

	this.childCount = function(parentObj) {

		if (typeof parentObj === 'object') {
			var parentId = parentObj._id;
			var Model = parentObj.Model;

			console.log('childCount parentId:', parentId);
			return Model.count({
				where: {
					parentId: parentId
				}
			});
		}

		return Promise.reject(new Error('fail to get count!'));
	}

	this.isParentOf = function(childObj, parentObj, recursive) {

		if (recursive === true) {
			if(typeof parentObj === 'object' && typeof childObj === 'object'){
				var hasChild = true;
				for(var key in parentObj){
					if(key.toLowerCase() === 'owner' || key.toLowerCase() === 'ownerid' || key.toLowerCase() === 'spaceid' || key.toLowerCase() === 'appid' )
						hasChild = childObj[key] && childObj[key] === parentObj[key];
				}
				hasChild = parentObj.fullname && childObj.fullname && childObj.fullname.indexOf(parentObj.fullname) !== false;
				//console.log('hasChild:',hasChild);
				return hasChild;
			}
		} else {
			if(typeof parentObj === 'object' && typeof childObj === 'object'){
				return parentObj.parentId === childObj._id;
			}
		}
		
		return new Error('error exist');
	}

	this.isChildOf = function(parentObj, childObj, recursive) {

		return this.isParentOf(childObj,parentObj,recursive);
	}
}

/*
TreeTable.prototype.getChild = function(parentObj, childData) {
	var Model = parentObj.constructor;

	var spaceId = parentObj.getDataValue('spaceId');
	var appId = parentObj.getDataValue('appId');
	var fullname = parentObj.getDataValue('fullname');
	var data = childData;

	if (isNaN(data)) {
		if (typeof data === 'string') {
			return Model.findOne({
				where: {
					spaceId: spaceId,
					appId: appId,
					fullName: fullName + '.' + data
				}
			});
		}
		if (typeof data === 'object') {
			for (key in data) {
				if (key.toLowerCase() === 'spaceid') {
					spaceId = data[key];
					if (data['appId']) {
						appId = data['appId'];
					}
					if (data['appid']) {
						appId = data['appid'];
					}
					if (data['name']) {
						fullName = fullName + '.' + data['name'];
						return Model.findOne({
							where: {
								spaceId: spaceId,
								appId: appId,
								fullName: fullName
							}
						});
					}
				}
			}
		}
	} else { //is number
		if (data > 0) {
			return Model.findById(data);
		}
	}
	//by default, return first child under current category
	return Model.findOne({
		where: {
			spaceId: spaceId,
			appId: appId,
			fullname: {
				$like: fullname + '.%'
			}
		}
	})
};

TreeTable.prototype.getChildren = function(parentObj, mode) {
	
	console.log('in TreeTable getChildren');
	var Model = parentObj.constructor;
	
	console.log('parentObj:',parentObj);
	console.log('Model:',Model);

	var spaceId = parentObj.getDataValue('spaceId');
	var appId = parentObj.getDataValue('appId');
	var fullname = parentObj.getDataValue('fullname');
	var thisId = parentObj.getDataValue('_id');

	if (!mode) {
		mode = 'child';
	}

	if (mode.toLowerCase() === 'child') {
		return Model.findAll({
			where: {
				parentId: thisId
			}
		});
	}

	Model.findAll({
		where: {
			spaceId: spaceId,
			appId: appId,
			fullname: {$like: fullname + '.%'}
		}
	}).then(function(models) {

		if (mode.toLowerCase() === 'all') {
			return models;
		}
		if (mode.toLowerCase() === 'leaf') {
			fNames = [];
			var retModels = [].concat(models);
			models.forEach(function(model) {
				fNames.push(model.fullName);
			});
			models.forEach(function(model) {
				fName = model.fullName;
				fNames.forEach(function(fn) {
					if (fn.indexOf(fName + '.') !== -1) {
						retModels.slice(retModels.indexOf(model), 1);
					}
				});
			});
			return retModels;
		}
	});
};

TreeTable.prototype.getParent = function(childObj) {

	var Model = childObj.constructor;

	if (childObj && childObj.parentId) {
		var parentId = childObj.parentId;

		if (!isNaN(parentId) && parentId > 0) {
			return Model.findById(parentId);
		}
	}
};

TreeTable.prototype.getAllParent = function(childObj){
	
	var defer = Q.defer();
	
	if(typeof childObj === 'object'){
		var allParents = [];
		
		if(childObj.parentId){
			var parentId = childObj.parentId;
			promiseWhile(
				function(){
					return parentId > 0;
				},
				function(){
					childObj.findById(parentId).then(function(obj){
						if(obj){
							parentId = obj.parentId;
							allParents.push(obj);
						}
					});
				},
				function(){
					defer.resolve(allParents);
				}
			);
		}
		else{
			defer.reject('no find parentId');
		}		
	}else{
		defer.reject('invalid child obj');
	}
	
	return defer.promise;
};

TreeTable.prototype.addChild = function(parentObj, childData) {

	if (typeof parentObj === 'object') {
		var Model = childObj.constructor;

		var spaceId, appId, childName;
		if (parentObj && parentObj.spaceId) {
			spaceId = parentObj.spaceId;
		}
		if (parentObj && parentObj.spaceId) {
			appId = parentObj.appId;
		}

		if (typeof childData === 'string') {
			childName = childData;
		}

		if (typeof childData === 'object') {
			if (childData && childData.name) {
				childName = childData.name;
			}
			if (childData && childData.spaceId) {
				spaceId = childData.spaceId;
			}
			if (childData && childData.appId) {
				appId = childData.appId;
			}
		}

		if (childName && spaceId) {
			names = childName.split('.');
			var i = 0;
			var theParentObj = Object.assign({}, parentObj);
			var theChildObj = Object.assign({}, parentObj);
			promiseWhile(function(theParentObj) {
				i++;
				theChildObj.name = names.slice(i, 1);
				theChildObj.fullName += '.' + names.slice(i, 1);
				theChildObj.parentId = theParentObj._id;
				theChildObj.spaceId = spaceId;
				theChildObj.appId = appId;
				return theParentObj.findOrCreate(theChildObj).then(function(result) {
					theParentObj = result;
					theChildObj = result;
				});
			}, function() {
				return i < names.length;
			}, function() {
				//return last object
				if (typeof childData === 'object') {
					theChildObj = Object.assign(theChildObj, childData);
				}
				return theChildObj;
			})
		}
	}




};

TreeTable.prototype.getRoot = function(childObj) {
	if (typeof childObj === 'object') {
		return childObj.constructor.findById(1);
	}
};

TreeTable.prototype.hasChild = function(parentObj) {

	if (typeof parentObj === 'object') {
		var fName = parentObj.fullName;
		parentObj.constructor.findOne({
			fullName: {$like: fName + '.%'},
			parentId: parentObj._id
		}).then(function(child) {
			if (child) {
				return true;
			} else {
				return false;
			}
		});
	}
};
*/

// `condition` is a function that returns a boolean
// `body` is a function that returns a promise
// `done` is a function that returns a promise, it will call after complete loop
// returns a promise for the completion of the loop

/*
var promiseWhile = function(condition, body, done) {
	var defer = Q.defer();

	function loop() {
		// When the result of calling `condition` is no longer true, we are
		// done.
		if (!condition()) return defer.resolve(done);
		// Use `when`, in case `body` does not return a promise.
		// When it completes loop again otherwise, if it fails, reject the
		// done promise
		Q.when(body(), loop, defer.reject);
	}

	// Start running the loop in the next tick so that this function is
	// completely async. It would be unexpected if `body` was called
	// synchronously the first time.
	Q.nextTick(loop);

	// The promise
	return defer.promise;
}
*/

module.exports = TreeTable;
