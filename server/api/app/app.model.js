'use strict';

import sqldb from '../../sqldb';
import _ from 'lodash';
var Promise = require('bluebird');

export default function (sequelize, DataTypes) {
	return sequelize.define('App', {
		_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		name: {
			type: DataTypes.STRING
		},
		alias: DataTypes.STRING,
		description: DataTypes.STRING,
		typeId: DataTypes.INTEGER,
		spaceId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		active: DataTypes.BOOLEAN
	}, {
			classMethods: {
				addType: function (typeData) {
					return this.getType(typeData, true);
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
						typeData.owner = 'app';
						var tyName = typeData.name;
						if (tyName.substr(0, 4).toLowerCase() !== 'app.') {
							tyName = 'app.' + tyName;
						}
						typeData.name = tyName;
						//console.log('app model typeData:', JSON.stringify(typeData));
						return Category.getType(typeData, true);
					}

					//otherwise return promise reject
					sequelize.Promise.reject(new Error('fail to add type!'));
				},
				add: function (appData, spaceId) {

					var app;
					var typeId;
					var App = sqldb.App;
					var Category = sqldb.Category;
					var Nut = sqldb.Nut;
					var PermitRole = sqldb.PermitRole;
					var isNewApp = false;

					return new Promise(function (resolve, reject) {

						//console.log('1 appData:', JSON.stringify(appData));

						var typeName;

						for (var key in appData) {
							if (key.toLowerCase() === 'type' || key.toLowerCase() === 'typename') {
								typeName = appData[key];
							}
						}

						if (appData.typeId) {
							return resolve(appData.typeId);
						} else if (typeName) {
							return App.addType({
								name: typeName,
								spaceId: spaceId
							}).then(function (type) {
								//console.log('after get type:', JSON.stringify(type));
								return resolve(type._id);
							});
						} else {
							return reject('fail to get typeId in create app!');
						}

					}).then(function (typeId) {

						//console.log('2: typeId:',typeId);

						var appName = appData.name;
						appData.typeId = typeId;

						if (!appName) {
							return Promise.reject('fail to find appName in create app!');
						} else {
							appData.alias = appData.alias || appName;

							//console.log("createApp appData before created app:", JSON.stringify(appData));

							App.belongsTo(Category, { as: 'type' });

							return App.findOrCreate({
								where: {
									name: appName,
									spaceId: spaceId
								},
								defaults: appData
							}).spread(function (result, created) {
								isNewApp = created;
								//console.log('created:',created);
								//console.log('result:',JSON.stringify(result));
								if (created) {
									return Promise.resolve(result);
								} else {
									//console.log('not create app result:',result);
									return new Promise(function (resolve, reject) {
										return resolve(result);
									})
								}
							});
						}
					}).then(function (newApp) {
						app = newApp;
						var nuts;
						var type;
						if (appData.nuts) {
							nuts = appData.nuts;
							type = 'nut.normal';
						}
						if (appData.cores) {
							nuts = appData.cores;
							type = 'nut.core';
						}
						if (!isNewApp) {
							return Promise.resolve(app);
						}

						if (!nuts) {
							return Promise.reject('fail to find nuts data when creating app!');
						}

						var nutArray = [];

						//console.log('nuts:', JSON.stringify(nuts));

						for (var key in nuts) {							
							var nutData = nuts[key];
							//console.log('nutData:', nutData);
							var nut = {};
							nut.name = key;
							nut.alias = nutData.alias || key;			
							nut.description = nutData.description || nut.alias;
							nut.type = nutData.type || type;
							nut.spaceId = spaceId;
							nut.appId = app._id;
							nutArray.push(nut);
						}
						
						//console.log('nutArray:', JSON.stringify(nutArray));

						return Nut.addBulkNut(nutArray);

					})
						.then(function () {
							if (!isNewApp) {
								return Promise.resolve(null);
							}
							return Nut.findAll({
								where: {
									spaceId: spaceId,
									appId: app._id
								}
							}).then(function (nuts) {
								//add nut permits
								var permitRoleList = [];
								//console.log('nuts:', JSON.stringify(nuts));
								//console.log('appData:', JSON.stringify(appData));
								nuts.forEach(function (nut) {
									var nutName = nut.name;
									var appName = app.name;
									var grants;
									if (appData['cores'] && appData['cores'][nutName]['grants']) {
										grants = appData['cores'][nutName]['grants'];
									}
									if (appData['nuts'] && appData['nuts'][nutName]['grants']) {
										grants = appData['nuts'][nutName]['grants'];
									}
									//console.log('grants:', JSON.stringify(grants));
									/**
									 * grants format:
									 * {
									 * 		"roleName|roleAlias": "permitName|permitAlias,....",
									 * 		"roleName|roleAlias": ["permitName|permitAlias",...],
									 * 		"roleName|roleAlias": [{name:xxx,alias:xxxx},...]
									 * }
									 */
									for (var key in grants) {
										var permits = grants[key];
										var roleData = {};
										var permitList = [];
										//console.log('typeof permits:',typeof permits);
										if (typeof permits === 'object') {
											permits.forEach(function (permitData) {
												if (typeof permitData === 'string') {
													var posList = permitData.split("|");
													permitList.push({
														name: posList[0],
														alias: posList[1] || posList[0]
													})
												}
												if(typeof permitData === 'object'){
													permitList.push(permitData);
												}
											})
											//permitList = permits;
										}
										if (typeof permits === 'string') {
											var pList = permits.split(",");
											//console.log('pList', pList);
											pList.forEach(function (p) {
												var psList = p.split("|");
												//console.log('psList', psList);
												//console.log('psList[0]', psList[0]);
												//console.log('psList[1]', psList[1]);
												permitList.push({
													name: psList[0],
													alias: psList[1] || psList[0]
												})
											})
										}
										var rList = key.split("|");
										//console.log('rList', rList);
										//console.log('rList[0]', rList[0]);
										//console.log('rList[1]', rList[1]);
										roleData.name = rList[0];
										roleData.alias = rList[1] || rList[0];
										permitList.forEach(function (permit) {
											var oPermit = {};
											oPermit.role = roleData;
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
						}).then(function () {
							//console.log('1 app:',JSON.stringify(app));
							App.belongsTo(Category, { as: 'type' });
							return App.find({
								where: {
									_id: app._id
								},
								include: [{
									model: Category, as: 'type'
								}]
							});
						})
				},
				bulkAdd: function (listOfAppData, spaceId) {

					var that = this;
					var apps = [];

					return Promise.each(listOfAppData, function (appData) {
						return that.add(appData, spaceId).then(function (app) {
							//console.log('app:',JSON.stringify(app));
							apps.push(app);
						})
					}).then(function () {
						//console.log('apps:',JSON.stringify(apps));
						return Promise.resolve(apps);
					})
				}
			},
		});
}
