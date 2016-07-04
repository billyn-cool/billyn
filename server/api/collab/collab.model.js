'use strict';

import _ from 'lodash';
var Promise = require('bluebird');
import sqldb from '../../sqldb';
import TreeTable from '../../sqldb/treeTable';

export default function (sequelize, DataTypes) {
	return sequelize.define('Collab', {
		_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING
		},
		fullname: {
			type: DataTypes.STRING
		},
		alias: DataTypes.STRING,
		description: DataTypes.STRING,
		typeId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		parentId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		appId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		spaceId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		creatorId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		active: DataTypes.BOOLEAN
	}, {
			classMethods: {

				addType: function (typeData) {
					typeData.name = typeData.name.indexOf('collab.') === 0 ? typeData.name : 'collab.' + typeData.name;
					var Category = sqldb.Category;
					//console.log('addType typeData:',JSON.stringify(typeData));
					return Category.addType(typeData);
				},
				getType: function (typeData, autoCreated) {
					//console.log('in app Category:', Category);
					//console.log('in app User:', User);
					//console.log('in app sqldb:', sqldb);
					var Category = sqldb.Category;
					//var Category = sqldb.Category;
					//console.log('in app Category:', Category);
					if (typeof typeData === 'string' && isNaN(typeData)) {
						var typeName = typeData;

						typeData = {};

						typeData.name = typeName;

						//console.log('in space getType');
						//console.log('in space Category:', Category);
						//console.log('space getType typeData:', JSON.stringfy(typeData));
					}

					if (typeof typeData === 'object' && !_.isEmpty(typeData)) {
						typeData.owner = 'collab';
						var tyName = typeData.name;
						if (tyName.substr(0, 4).toLowerCase() !== 'collab.') {
							tyName = 'collab.' + tyName;
						}
						typeData.name = tyName;
						//console.log('app model typeData:', JSON.stringify(typeData));
						return Category.getType(typeData, true);
					}

					//otherwise return promise reject
					sequelize.Promise.reject(new Error('fail to add type for collab!'));
				},

				bulkAdd: function (bulkCollabData, context) {

					//console.log('bulkAdd:', JSON.stringify(bulkCollabData));

					var that = this;
					var results = [];
					return Promise.each(bulkCollabData, function (collabData) {
						return that.add(collabData, context).then(function (c) {
							//console.log('c:',JSON.stringify(c));
							results.push(c);
						});
					}).then(function () {
						return Promise.resolve(results);
					});

					/*
					return Promise.each(bulkCollabData, function (collabData) {

						
						if (!collabData.type && !collabData.typeId) {
							collabData.type = 'normal';
						}
						if (collabData.type && !collabData.typeId) {
							var spaceId = collabData.spaceId;

							var typeData = {
								name: collabData.type,
								spaceId: spaceId
							};

							//console.log('bulkCreate typeData:',JSON.stringify(typeData));

							return that.addType(typeData).then(function (type) {
								collabData.typeId = type._id;
								//console.log('collabData:', collabData);
								return Promise.resolve(null);
							});
						} else {
							return Promise.resolve(null);
						}
					}).then(function () {
						//console.log('2 bulkCollabData:', JSON.stringify(bulkCollabData));
						return that.bulkAdd(bulkCollabData);
					});*/

				},

				/**
				 * 
				 */
				add: function (collabData, context) {
					//console.log('collabData:', JSON.stringify(collabData));
					if (context && context.spaceId) {
						collabData.spaceId = context.spaceId;
					}
					var parentRoles, childRoles;
					if (collabData.parentRoles) {
						parentRoles = collabData.parentRoles;
					}
					if (collabData.childRoles) {
						childRoles = collabData.childRoles;
					}
					var that = this;

					return new Promise(function (resolve, reject) {
						//first add type
						if (collabData.typeId) {
							var type = {
								_id: collabData.typeId
							};
							//delete collabData.typeId;
							return resolve(type);
						}
						var typeData = {};
						typeData.spaceId = collabData.spaceId;
						if (!collabData.type) {
							typeData.name = 'normal';
							typeData.alias = "normal collab";
						}
						if (collabData.type && typeof collabData.type === 'string') {
							typeData.name = collabData.type;
						}
						if (collabData.type && typeof collabData.type === 'object') {
							typeData = Object.assign(typeData, collabData.type);
						}
						//console.log('typeData:',JSON.stringify(typeData));
						return that.addType(typeData).then(function (type) {
							//console.log('1 type:',JSON.stringify(type));
							return resolve(type);
						});
					}).then(function (type) {
						//console.log('2 collabData:',JSON.stringify(collabData));
						collabData.typeId = type._id;
						//return that.getCollabRoot(collabData).addChild(collabData);
						//return that.getCollabRoot(collabData).then(function (collabRoot) {
						//return collabRoot.addChild(collabData);
						//});

						collabData.fullname = collabData.fullname || collabData.name;

						return that.findOrCreate({
							where: {
								fullname: collabData.name,
								spaceId: collabData.spaceId
							},
							defaults: collabData
						}).spread(function (collab, created) {
							if (created) { return Promise.resolve(collab); }
							else {
								return collab.update(collabData);
							}
						});
						//}).spread(function (collab, created) {
					}).then(function (collab) {
						//console.log('created:', created);
						//console.log('2 collabData:',JSON.stringify(collabData));
						var theCollab = collab;
						if (parentRoles || childRoles) {
							var listData = [];
							if (parentRoles) {
								parentRoles.forEach(function (r) {
									if (r && r.parentRoleId) {
										listData.push({
											parentRoleId: r.parentRoleId,
											collabId: collab._id,
											spaceId: collab.spaceId
										})
									} else {
										listData.push({
											parentRole: r,
											collabId: collab._id,
											spaceId: collab.spaceId
										})
									}
								})
							}
							if (childRoles) {
								childRoles.forEach(function (r) {
									if (r && r.childRoleId) {
										listData.push({
											childRoleId: r.childRoleId,
											collabId: collab._id,
											spaceId: collab.spaceId
										})
									} else {
										listData.push({
											childRole: r,
											collabId: collab._id,
											spaceId: collab.spaceId
										})
									}
								})
							}
							//console.log('listData:', JSON.stringify(listData));
							var CollabRole = sqldb.CollabRole;
							var Category = sqldb.Category;
							var Role = sqldb.Role;
							that.belongsTo(Category, { as: 'type' });
							that.hasMany(CollabRole, { foreignKey: 'collabId', as: 'collabRoles' });
							//that.hasMany(CollabRole,{foreignKey: 'collabId', as:'childRoles'});
							CollabRole.belongsTo(Role, { as: 'role' })

							return CollabRole.bulkAdd(listData).then(function (results) {
								//console.log('results:',JSON.stringify(results));
								return that.find({
									where: {
										_id: theCollab._id
									},
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
								})/*.then(function(rs){
									console.log('rs:',JSON.stringify(rs));
								})*/
							});
						} else {
							return that.find({
								where: {
									_id: collab._id
								},
								include: {
									model: Category, as: 'type'
								}
							})
						}
					});
				},

				/**
				 * format of roleData: 
				 * {
				 * 		collabId: xxx,
				 * 		parentRoleId: xxx,
				 * 		childRoleId: xxx
				 * } 
				 *  or
				 * {
				 * 		collabId: xxx,
				 * 		parentRole: xxx(name of role),
				 * 		childRole: xxx,
				 * 		spaceId: xxx (if use role name, must provide spaceId)
				 * }
				 */
				addRole: function (roleData) {
					var CollabRole = sqldb.CollabRole;
					return CollabRole.addCollabRole(roleData);
				},

				getCollabRoot: function (collabData) {

					//console.log('in getCollabRoot collabData:', JSON.stringify(collabData));

					var Model = this;
					//var attributeData = attrData;

					var treeObj = new TreeTable();

					//console.log('getCollabRoot treeObj:', treeObj);

					return treeObj.getRoot(this).then(function (root) {
						//console.log('in getCollabRoot root:', JSON.stringify(root));
						var whereData = {};

						if (typeof collabData === 'object') {
							for (var key in collabData) {
								if (key.toLowerCase() === 'owner' || key.toLowerCase() === 'ownertype') {
									whereData.owner = collabData[key];
									//delete attributeData[key];
								}
								if (key.toLowerCase() === 'ownerid') {
									whereData.ownerId = collabData[key];
									//delete attributeData[key];
								}
								if (key.toLowerCase() === 'spaceid') {
									whereData.spaceId = collabData[key];
									//delete attributeData[key];
								}
								if (key.toLowerCase() === 'appid') {
									whereData.appId = collabData[key];
									//delete attributeData[key];
								}
							}
						}

						whereData.name = 'collabRoot';
						whereData.fullname = 'root.collabRoot';
						whereData.parentId = 1;

						//console.log('getAttributeRoot root: ', JSON.stringify(root));

						//console.log('getCollabRoot whereData: ', JSON.stringify(whereData));

						return Model.findOrCreate({
							where: whereData,
							defaults: {
								alias: 'collabRoot'
							}
						})
							.spread(function (entity, created) {
								//console.log('getCollabRoot entity: ', JSON.stringify(entity));
								//return Promise.resolve(entity);
								return entity;
							});
					});
				},

				/**
				 * 1. find user roles in space
				 * 2. find parent roles through CollabRole table
				 * 3. find NutPermit through parent roles
				 * 4. organize all NutPermit
				 */
				findAllUserNutPermit: function (userId, spaceId) {

					var Collab = sqldb.Collab;
					var Role = sqldb.Role;
					var PermitRole = sqldb.PermitRole;
					var Permit = sqldb.Permit;
					var Nut = sqldb.Nut;
					var Space = sqldb.Space;
					var Category = sqldb.Category;

					Collab.belongsToMany(Role, { through: 'CollabRole', foreignKey: 'collabId', as: 'childRoles' });
					Collab.belongsToMany(Role, { through: 'CollabRole', foreignKey: 'collabId', as: 'parentRoles' });
					Role.hasMany(PermitRole, { as: 'nutPermits' });
					PermitRole.belongsTo(Permit, { as: 'permit' });
					PermitRole.belongsTo(Role, { as: 'role' });
					PermitRole.belongsTo(Nut, { as: 'nut', foreignKey: 'ownerId' });
					Space.hasMany(Collab, { as: 'collabs' });

					return Role.findAllUserSpaceRole(userId, spaceId)
						.then(function (roles) {
							var childRoleList = [];
							roles.forEach(function (role) {
								childRoleList.push(role._id);
							})
							//console.log('user roles:', childRoleList);
							return Space.findAll({
								include: [
									{
										model: Collab, as: 'collabs',
										where: {
											spaceId: {
												$ne: spaceId
											}
										},
										include: [
											{
												model: Role, as: 'childRoles',
												where: {
													_id: {
														$in: childRoleList
													}
												},
												through: {
													where: {
														roleType: 'child'
													}
												}
											},
											{
												model: Role, as: 'parentRoles',
												include: [
													{
														model: PermitRole, as: 'nutPermits',
														include: [
															{
																model: Permit, as: 'permit',
															},
															{
																model: Nut, as: 'nut'
															},
															{
																model: Role, as: 'role'
															}
														]
													}
												]
											}
										]
									}
								]
							})
						}).then(function (spaces) {
							//console.log('spaces:',JSON.stringify(spaces));
							spaces.forEach(function (space) {
								var collabs = space.collabs;
								collabs.forEach(function (collab) {
									collab.parentRoles.forEach(function (role, index) {
										if (role.CollabRole.roleType === 'child') {
											collab.parentRoles.splice(index, 1);
										}
									})
								})
							});
							return Promise.resolve(spaces);
						});
				}
			},
			instanceMethods: {
				addChild: function (childData) {
					//console.log('addChild childData:', JSON.stringify(childData));
					var treeObj = new TreeTable();
					return treeObj.addChild(this, childData);
				},
				getChildren: function (childData) {
					//console.log('getChildren:', JSON.stringify(childData));
					//var treeObj = new TreeTable();
					//return treeObj.getChildren(this, childData);

					var Collab = sqldb.Collab;
					var CollabRole = sqldb.CollabRole;
					var Role = sqldb.Role;
					var Category = sqldb.Category;

					var mode = 'all';
					if (childData.mode) {
						mode = childData.mode;
					}

					Collab.belongsTo(Category, { as: 'type' });
					Collab.hasMany(CollabRole, { foreignKey: 'collabId', as: 'collabRoles' });
					//that.hasMany(CollabRole,{foreignKey: 'collabId', as:'childRoles'});
					CollabRole.belongsTo(Role, { as: 'role' });

					var findData = {
						spaceId: childData.spaceId,
						name: {
							$ne: 'collabRoot'
						},
						fullname: {
							$like: this.fullname + '.%'
						}
					};

					if (mode.toLocaleLowerCase() === 'child') {
						findData.parentId = this._id;
					}

					var includeData = [
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
					];

					return Collab.findAll({
						where: findData,
						include: includeData
					}).then(function (collabs) {
						if (mode.toLocaleLowerCase() === 'leaf') {
							var theList = [];
							var theCollabs = collabs.slice();

							collabs.forEach(function (collab, index) {
								var fullname = collab.fullname;
								var id = collab._id;
								theCollabs.forEach(function (tCollab, index2) {
									var fullname2 = tCollab.fullname;
									//var id2 = tCollab._id;
									//find none-leaf element first
									if (fullname2.indexOf(fullname + '.') !== -1 && theList.indexOf(id) === -1) {
										//console.log('fullname:fullname2',fullname + ':' + fullname2)
										theList.push(id);
									}
								})
							});

							var retList = [];
							collabs.forEach(function (collab) {
								if (theList.indexOf(collab._id) === -1) {
									retList.push(collab);
								}
							});

							return Promise.resolve(retList);
						} else {
							return Promise.resolve(collabs);
						}
					})
				},
				getChild: function (childData) {
					var treeObj = new TreeTable();
					return treeObj.getChild(this, childData);
				},
				getParent: function (recursive) {
					var treeObj = new TreeTable();
					return treeObj.getParent(this, recursive);
				},
				childCount: function () {
					var treeObj = new TreeTable();
					return treeObj.childCount(this);
				},
				isParentOf: function (childObj, recursive) {
					var treeObj = new TreeTable();
					return treeObj.isParentOf(childObj, this, recursive);
				},
				isChildOf: function (parentObj, recursive) {
					var treeObj = new TreeTable();
					return treeObj.isChildOf(parentObj, this, childData);
				}
			}
		});
}
