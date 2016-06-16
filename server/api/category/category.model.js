'use strict';

import _ from 'lodash';
var Promise = require("bluebird");
import TreeTable from '../../sqldb/treeTable';

export default function(sequelize, DataTypes) {
	return sequelize.define('Category', {
		_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		parentId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		spaceId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		appId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		name: DataTypes.STRING,
		alias: DataTypes.STRING,
		fullname: DataTypes.STRING,
		owner: DataTypes.STRING,
		ownerId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		active: DataTypes.BOOLEAN
	}, {
		getterMethods: {
			typeName: function() {
				var fname = this.fullname;
				//console.log('fname:', fname);
				var fname2 = fname.slice(fname.indexOf('.') + 1);
				//console.log('fname2:', fname2);
				return fname2.slice(fname2.indexOf('.') + 1);
			},
			categoryName: function() {
				var fname = this.fullname;
				var fname2 = fname.slice(fname.indexOf('.') + 1);
				return fname2.slice(fname2.indexOf('.') + 1);
			},
			name: function() {
				var fname = this.fullname;
				var fname2 = fname.slice(fname.indexOf('.') + 1);
				return fname2.slice(fname2.indexOf('.') + 1);
			}
		},
		classMethods: {
			getRoot: function() {
				//console.log('in getRoot this:', this);
				return this.findOrCreate({
						where: {
							name: 'root',
							fullname: 'root'
						},
						defaults: {
							alias: 'root'
						}
					})
					.spread(function(entity, created) {
						//console.log('getRoot spread');
						return Promise.resolve(entity);
					}).catch(function(err){
						//console.log('getRoot err:',JSON.stringify(err));
					});
			},
			//usually, typeData is a object which contain owner or spaceId
			getTypeRoot: function(typeData) {

				//console.log('in getTypeRoot typeData:', typeData);

				var Model = this;

				return this.getRoot().then(function(root) {
					//console.log('getTypeRoot root:',JSON.stringify(root));
					var whereData = {};

					if (typeof typeData === 'object') {
						for (var key in typeData) {
							if (key.toLowerCase() === 'owner' || key.toLowerCase() === 'ownertype') {
								whereData.owner = typeData[key];
								//delete typeData[key];
							}
							if (key.toLowerCase() === 'appid' || key.toLowerCase() === 'spaceid' || key.toLowerCase() === 'ownerid') {
								whereData.owner = typeData[key];
								//delete typeData[key];
							}
						}
					}

					whereData.name = 'typeRoot';
					whereData.fullname = 'root.typeRoot';
					whereData.parentId = 1;

					//console.log('getTypeRoot root: ', JSON.stringify(root));

					//console.log('getTypeRoot whereData: ', JSON.stringify(whereData));

					return Model.findOrCreate({
						where: whereData,
						defaults: {
							alias: 'typeRoot'
						}
					})
						.spread(function(entity, created) {
							//console.log('getTypeRoot created: ', created);
							return Promise.resolve(entity);
						});
				});

			},
			getCategoryRoot: function(categoryData) {

				var Model = this;

				return this.getRoot().then(function(root) {
					var whereData = {};

					if (typeof categoryData === 'object') {
						for (var key in categoryData) {
							if (key.toLowerCase() === 'owner' || key.toLowerCase() === 'ownertype') {
								whereData.owner = categoryData[key];
								//delete categoryData[key];
							}
							if (key.toLowerCase() === 'appid' || key.toLowerCase() === 'spaceid' || key.toLowerCase() === 'ownerid') {
								whereData.owner = categoryData[key];
								//delete categoryData[key];
							}
						}
					}

					whereData.name = 'categoryRoot';
					whereData.fullname = 'root.categoryRoot';
					whereData.parentId = 1;

					console.log('getCategoryRoot root: ', JSON.stringify(root));

					console.log('getCategoryRoot whereData: ', JSON.stringify(whereData));

					return Model.findOrCreate({
						where: whereData,
						defaults: {
							alias: 'categoryRoot'
						}
					})
						.spread(function(entity, created) {
							console.log('getCategoryRoot created: ', created);
							return Promise.resolve(entity);
						});
				});
			},
			addType: function(typeData) {

				var typeName;
				var owner;
				var ownerId;
				var spaceId;
				var appId;

				//console.log('typeData:',typeData);

				if (typeof typeData === 'string') {
					typeName = typeData;
					typeData = {};
					typeData.name = typeName;
				}

				if (typeof typeData === 'object') {
					//console.log('typeData 2: ', typeData);
					for (var key in typeData) {
						if (key.toLowerCase() === 'name' || key.toLowerCase() === 'typename') {
							typeName = typeData[key];
							delete typeData[key];
						}
						if (key.toLowerCase() === 'owner') {
							owner = typeData[key];
							delete typeData[key];
						}
						if (key.toLowerCase() === 'ownerid') {
							ownerId = typeData[key];
							delete typeData[key];
						}
						if (key.toLowerCase() === 'spaceid') {
							spaceId = typeData[key];
							delete typeData[key];
						}
						if (key.toLowerCase() === 'appid') {
							appId = typeData[key];
							delete typeData[key];
						}
					}
				}
				//console.log('typeName:',typeName);

				var typeContext = {};

				if (owner) {
					typeContext.owner = owner;
				}
				if (ownerId && ownerId !== -1) {
					typeContext.ownerId = ownerId;
				}
				if (spaceId && spaceId !== -1) {
					typeContext.spaceId = spaceId;
				}
				if (appId && appId !== -1) {
					typeContext.appId = appId;
				}

				if (typeName) {
					var names = typeName.split('.');
					//console.log('names:', names);
					//console.log('typeData:',typeData);
					//console.log('typeContext:',typeContext);

					var Model = this;

					return this.getTypeRoot(typeContext)
						.then(function(typeRoot) {
							//console.log('typeRoot:',typeRoot);
							var parentId = typeRoot._id;
							var fullname = typeRoot.fullname;
							var finalType;
							var i = 0;
							return Promise.reduce(names, function(finalType, tName) {
								
								typeContext.name = tName;
								typeContext.fullname = fullname + '.' + tName;
								typeContext.parentId = parentId;
								//console.log('name: ',tName);
								//console.log('fullName: ',fullname);
								//console.log('parentId: ',parentId);
								//console.log('typeContext',JSON.stringify(typeContext));
								var defaults = {};
								if(i++ === names.length - 1){
									typeData.alias = typeData.alias || typeName;
									defaults = typeData;
								}
								return Model.findOrCreate({
									where: typeContext,
									defaults: defaults
								})
									.spread(function(theType, created) {
										parentId = theType._id;
										fullname = theType.fullname;
										return finalType = theType;
										//console.log('finalType:', finalType);
										//Promise.resolve(finalType);
									});
							}, 0)
								.then(function(finalType) {
									//console.log('promise.map finalType: ',finalType);
									return Promise.resolve(finalType);
								});
						});
				}

				return Promise.reject(new Error('fail to add type!'));
			},
			addCategory: function(categoryData) {

				var categoryName;
				var owner;
				var ownerId;
				var spaceId;
				var appId;

				//console.log('categoryData:',categoryData);

				if (typeof categoryData === 'string') {
					categoryName = categoryData;
					categoryData = {};
					categoryData.name = categoryName;
				}

				if (typeof categoryData === 'object') {
					//console.log('categoryData 2: ', categoryData);
					for (var key in categoryData) {
						if (key.toLowerCase() === 'name' || key.toLowerCase() === 'categoryname') {
							categoryName = categoryData[key];
							delete categoryData[key];
						}
						if (key.toLowerCase() === 'owner') {
							owner = categoryData[key];
							delete categoryData[key];
						}
						if (key.toLowerCase() === 'ownerid') {
							ownerId = categoryData[key];
							delete categoryData[key];
						}
						if (key.toLowerCase() === 'spaceid') {
							spaceId = categoryData[key];
							delete categoryData[key];
						}
						if (key.toLowerCase() === 'appid') {
							appId = categoryData[key];
							delete categoryData[key];
						}
					}
				}
				//console.log('categoryName:',categoryName);

				var categoryContext = {};

				if (owner) {
					categoryContext.owner = owner;
				}
				if (ownerId && ownerId !== -1) {
					categoryContext.ownerId = ownerId;
				}
				if (spaceId && spaceId !== -1) {
					categoryContext.spaceId = spaceId;
				}
				if (appId && appId !== -1) {
					categoryContext.appId = appId;
				}

				if (categoryName) {
					var names = categoryName.split('.');
					//console.log('names:', names);
					//console.log('categoryData:',categoryData);
					//console.log('categoryContext:',categoryContext);

					var Model = this;

					return this.getCategoryRoot(categoryContext)
						.then(function(categoryRoot) {
							//console.log('categoryRoot:',categoryRoot);
							var parentId = categoryRoot._id;
							var fullname = categoryRoot.fullname;
							var finalCategory;
							return Promise.reduce(names, function(finalCategory, tName) {
								categoryData.alias = categoryData.alias || tName;
								categoryContext.name = tName;
								categoryContext.fullname = fullname + '.' + tName;
								categoryContext.parentId = parentId;
								//console.log('name: ',tName);
								//console.log('fullName: ',fullname);
								//console.log('parentId: ',parentId);
								//console.log('categoryContext',JSON.stringify(categoryContext));
								return Model.findOrCreate({
									where: categoryContext,
									defaults: categoryData
								})
									.spread(function(theCategory, created) {
										parentId = theCategory._id;
										fullname = theCategory.fullname;
										return finalCategory = theCategory;
										//console.log('finalCategory:', finalCategory);
										//Promise.resolve(finalCategory);
									});
							}, 0)
								.then(function(finalCategory) {
									//console.log('promise.map finalCategory: ',finalCategory);
									return Promise.resolve(finalCategory);
								});
						});
				}

				return Promise.reject(new Error('fail to add category!'));
			},
			getType: function(typeData, autoCreated) {
				//console.log('in Category typeData:', JSON.stringify(typeData));
				if (typeData && !isNaN(typeData) && typeData > 0) {
					return this.findById(typeData);
				}
				//console.log('Category.getType 2');

				if (typeof typeData === 'object') {
					return this.getTypeRoot(typeData).then(function(typeRoot) {
						//console.log('Category getType typeRoot:',JSON.stringify(typeRoot));
						return typeRoot.getChild(typeData, autoCreated);
					})
				}

				//otherwise, return a promise reject
				return Promise.reject(new Error('fail to getType, maybe input wrong typeData'));
			}
		},
		instanceMethods: {
			addChild: function(childData) {
				var treeObj = new TreeTable();
				return treeObj.addChild(this, childData);
			},
			getChildren: function(childData) {
				var treeObj = new TreeTable();
				return treeObj.getChildren(this, childData);
			},
			getChild: function(childData, autoCreated) {
				var treeObj = new TreeTable();
				if (autoCreated === true) {
					var parentObj = this;
					return treeObj.getChild(this, childData).then(function(child){
						//console.log('Category getChild child:',JSON.stringify(child));
						if(child === 'undefined' || child == null || _.isEmpty(child)){
							//console.log('Category getChild this 2:',this);
							return treeObj.addChild(parentObj, childData)
						}else{
							return child;
						}
					});
				} else {
					return treeObj.getChild(this, childData);
				}

			},
			getParent: function(recursive) {
				var treeObj = new TreeTable();
				return treeObj.getParent(this, recursive);
			},
			childCount: function() {
				var treeObj = new TreeTable();
				return treeObj.childCount(this);
			},
			isParentOf: function(childObj, recursive) {
				var treeObj = new TreeTable();
				return treeObj.isParentOf(childObj, this, recursive);
			},
			isChildOf: function(parentObj, recursive) {
				var treeObj = new TreeTable();
				return treeObj.isChildOf(parentObj, this, childData);
			}
		}
	});
}
