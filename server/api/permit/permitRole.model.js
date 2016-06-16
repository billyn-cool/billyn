'use strict';

import _ from 'lodash';
import sqldb from '../../sqldb';
var Promise = require("bluebird");

export default function(sequelize, DataTypes) {
	return sequelize.define('PermitRole', {
		_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		owner: {
			type: DataTypes.STRING
		},
		ownerId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		permitId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		roleId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		spaceId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		active: DataTypes.BOOLEAN
	},{
		classMethods: {

			addPermitRole: function(permitRoleData){

			},

			addBulkPermitRole: function(bulkPermitRoleData){

				var PermitModel = sqldb.Permit;
				var RoleModel = sqldb.Role;
				var that = this;
				
				//console.log('bulkData:', JSON.stringify(bulkPermitRoleData));

				/*
				var proms = [];

				console.log('0');

				bulkPermitRoleData.forEach(function(prd){

					if(prd.permit && !prd.permitId){
						var permitData = {};
						permitData.name = prd.permit;
						permitData.spaceId = prd.spaceId;
						proms.push(PermitModel.addPermit(permitData).then(function(permit){
							prd.permitId = permit._id;
						}));
					}

					if(prd.role && !prd.roleId){
						var roleData = {};
						roleData.name = prd.permit;
						roleData.spaceId = prd.spaceId;
						proms.push(RoleModel.addRole(roleData).then(function(role){
							prd.roleId = role._id;
						}));
					}					
				});

				if(proms.length >0){
					console.log('proms:',proms);
					console.log('1 bulkPermitRoleData:',JSON.stringify(bulkPermitRoleData));
					Promise.all(proms).then(function(){
						console.log('2 bulkPermitRoleData:',JSON.stringify(bulkPermitRoleData));
						return that.bulkCreate(bulkPermitRoleData);
					})
				} else {
					return that.bulkCreate(bulkPermitRoleData);
				} */


				console.log('1 bulkPermitRoleData:', JSON.stringify(bulkPermitRoleData));				

				return Promise.each(bulkPermitRoleData, function(prData){

					//console.log('2 prData:',JSON.stringify(prData));
					//var prData = Object.assign({},pr);

					return new Promise(function(resolve, reject){
						//console.log('3');
						console.log('1 prData:',JSON.stringify(prData));
						if(prData.permit && ! prData.permitId){
							var permitData = {};
							if(typeof prData.permit === 'object'){
								permitData = Object.assign({},prData.permit);
							}
							if(typeof prData.permit === 'string'){
								permitData.name = prData.permit;
							}
							//permitData.name = prData.permit;
							permitData.spaceId = prData.spaceId;
							if(prData.owner){
								permitData.owner = prData.owner;
							}
							if(prData.ownerId){
								permitData.ownerId = prData.ownerId;
							}
							
							console.log('permitData',JSON.stringify(permitData));
							
							return PermitModel.addPermit(permitData).then(function(permit){
								prData.permitId = permit._id;
								return resolve(null);
							});
						} else {
							return resolve(null);
						}
					}).then(function(){
						console.log('2 prData:',JSON.stringify(prData));
						//console.log('4 bulkPermitRoleData:', JSON.stringify(bulkPermitRoleData));
						if(prData.role && ! prData.roleId){
							var roleData = {};
							if(typeof prData.role === 'object'){
								roleData = Object.assign({},prData.role);
							}
							if(typeof prData.role === 'string'){
								roleData.name = prData.role;
							}
							
							roleData.spaceId = prData.spaceId;

							console.log('roleData:',JSON.stringify(roleData));

							return RoleModel.addRole(roleData).then(function(role){
								//console.log('role:',JSON.stringify(role));
								prData.roleId = role._id;
								return Promise.resolve(null);
								});
						} else {
							return Promise.resolve(null);
						}
					});
				})
				.then(function(){
					//console.log('bulkPermitRoleData:', JSON.stringify(bulkPermitRoleData));
					return that.bulkCreate(bulkPermitRoleData);
				});

			}
		}
	});
}
