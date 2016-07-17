'use strict';

import _ from 'lodash';
var Promise = require('bluebird');
import sqldb from '../../sqldb';

export default function (sequelize, DataTypes) {
	return sequelize.define('CollabRole', {
		_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		description: DataTypes.STRING,
		collabId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		roleId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		roleType: {
			type: DataTypes.ENUM('parent', 'child')
		},
		joinStatus: {
			type: DataTypes.STRING,
			defaultValue: 'none'
		},
		active: DataTypes.BOOLEAN
	}, {
			classMethods: {
				//this is a clever add, it will first find collab and role, 
				//if not exist, create first
				//input format: {parentRoleId[childRoleId]: xxx, collabId: xxx} 
				//or {parentRole[childRole]: xxx, [spaceId: xxx], collab: xxx}
				addCollabRole: function (data) {
					var parentRoleId, childRoleId;
					var parentRole, childRole, collabId;
					var collab, collabRole;
					var spaceId;
					var theData = {};
					var Role = sqldb.Role;
					var Category = sqldb.Category;
					var Collab = sqldb.Collab;
					var that = this;

					Collab.belongsTo(Category, { as: 'type' });

					//console.log('addCollabRole data:', JSON.stringify(data));

					return new Promise(function (resolve, reject) {
						//first get parent role id
						if (data.parentRoleId) {
							parentRoleId = data.parentRoleId;
							return resolve(null);
							//return resolve(data.parentRoleId);
						}
						if (data.spaceId && data.parentRole) {
							//findOrCreate role and then return roleId
							var pRole = {};
							if(typeof data.parentRole === 'string'){
								pRole.name = data.parentRole;
							}
							if(typeof data.parentRole === 'object'){
								pRole = data.parentRole;
							}
							pRole.spaceId = data.spaceId;
							return Role.addRole(pRole).then(function (role) {
								parentRoleId = role._id;
								//console.log('0 parentRoleId:',parentRoleId);
								//console.log('role 1:',JSON.stringify(role));
								return resolve(role._id);
							});
						}
						return resolve(null);
					}).then(function () {
						//console.log('1 parentRoleId:',parentRoleId);
						//parentRoleId = roleId;
						if (data.childRoleId) {
							childRoleId = data.childRoleId;
							return Promise.resolve(null);
						}
						if (data.spaceId && data.childRole) {
							var cRole = {};
							if(typeof data.childRole === 'string'){
								cRole.name = data.childRole;
							}
							if(typeof data.childRole === 'object'){
								cRole = data.childRole;
							}
							cRole.spaceId = data.spaceId;
							//findOrCreate role and then return roleId
							return Role.addRole(cRole).then(function (role) {
								childRoleId = role._id;
							});
						}
						return Promise.resolve(null);
					}).then(function () {
						//console.log('2 childRoleId:',childRoleId);
						//console.log('2 parentRoleId:data',JSON.stringify(data));
						//find collab id
						//childRoleId = roleId;
						if (data.collabId) {
							collabId = data.collabId;
							return Promise.resolve(null);
						}
						if (data.collab) {
							return Collab.add(data.collab).then(function (collab) {
								collabId = collab._id;
								return Promise.resolve(null);
							});
						}
						//return Promise.resolve(null);
					}).then(function () {
						//console.log('3 parentRoleId:',parentRoleId);
						//console.log('3 childRoleId:',childRoleId);
						//console.log('3 collabId:',collabId);
						//collabId = result;
						if (parentRoleId && collabId) {
							//console.log('xxx');
							that.belongsTo(Role, { foreignKey: 'roleId', as: 'parentRole' });
							that.belongsTo(Collab, { as: 'collab' });
							Collab.belongsTo(Category, { as: 'type' });
							return that.findOrCreate({
								where: {
									collabId: collabId,
									roleId: parentRoleId,
									roleType: 'parent'
								},
								defaults: {
								}
							}).spread(function (row, create) {
								//console.log('row:', JSON.stringify(row));
								return that.find({
									where: {
										_id: row._id
									},
									include: [
										{
											model: Role, as: 'parentRole'
										},
										{
											model: Collab, as: 'collab',
											include: {
												model: Category, as: 'type'
											}
										}
									]
								})
							})
						}
						if (childRoleId && collabId) {
							//console.log('yyy');
							that.belongsTo(Role, { foreignKey: 'roleId', as: 'childRole' });
							that.belongsTo(Collab, { as: 'collab' });
							Collab.belongsTo(Category, { as: 'type' });
							//console.log('4:');
							var joinStatus = data.joinStatus || "joined";
							return that.findOrCreate({
								where: {
									collabId: collabId,
									roleId: childRoleId,
									roleType: 'child'
								},
								defaults: {
									joinStatus: joinStatus
								}
							}).spread(function (row, create) {
								//console.log('2 row:', JSON.stringify(row));
								if(!create){
									row.joinStatus = joinStatus;
									return row.save();
								} else {
									return Promise.resolve(row);
								}								
							}).then(function(row){
								return that.find({
									where: {
										_id: row._id
									},
									include: [
										{
											model: Role, as: 'childRole'
										},
										{
											model: Collab, as: 'collab',
											include: {
												model: Category, as: 'type'
											}
										}
									]
								})
							})
						}
					})
				},
				add: function (data) {
					return this.addCollabRole(data);
				},
				//this is a clever add, input is an array
				bulkAdd: function (data) {
					//console.log('collabRole data:',JSON.stringify(data))
					var that = this;
					var results = [];
					return Promise.each(data, function (itemData) {
						return that.addCollabRole(itemData).then(function (result) {
							//console.log('result:',JSON.stringify(result));
							results.push(result);
							return Promise.resolve(null);
						})
					}).then(function () {
						//console.log('1 results:',JSON.stringify(results));
						return Promise.resolve(results);
					})
				}
			},
		});
}
