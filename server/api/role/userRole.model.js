'use strict';

import _ from 'lodash';
var Promise = require("bluebird");
import TreeTable from '../../sqldb/treeTable';
import sqldb from '../../sqldb';

export default function(sequelize, DataTypes) {
	return sequelize.define('UserRole', {
		_id: {
			type: DataTypes.INTEGER,
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		userId: {
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
			//params: [{userId,roleId[roleName]},...]
			batchAdd: function (params) {
				//console.log('batchAdd in userRole model:',JSON.stringify(params));
				var that = this;
				var theParams = [];
				var Role = sqldb.Role;
				if(_.isArray(params)){
					//console.log('2 batchAdd in userRole model:',JSON.stringify(params));
					return Promise.each(params,function(ur){
						//console.log('batchAdd in userRole model:ur:',JSON.stringify(ur));
						if(ur.roleId && ur.userId){
							//console.log('1 theParams',JSON.stringify(theParams));
							if(ur.spaceId){
								theParams.push(ur);	
								//console.log('2 theParams',JSON.stringify(theParams));
								return Promise.resolve(null);	
							} else {
								//console.log('4 theParams',JSON.stringify(theParams));
								return Role.findById(ur.roleId).then(function(role){
									ur.spaceId = role.spaceId;
									theParams.push(ur);
									//console.log('3 theParams',JSON.stringify(theParams));
									return Promise.resolve(null);
								})
							}									
						} else {
							if(ur.spaceId){
								//console.log('6 theParams',JSON.stringify(theParams));
								var roleName;
								if(ur.role){
									roleName = ur.role;
								}
								if(ur.roleName){
									roleName = ur.roleName;
								}
								if(roleName){
									//console.log('7 theParams',JSON.stringify(theParams));
									return Role.find({
										where: {
											fullname: 'root.'+roleName,
											spaceId: ur.spaceId
										}
									}).then(function(role){
										//console.log('5 role',JSON.stringify(role));
										ur.roleId = role._id;
										theParams.push(ur);
										//console.log('5 theParams',JSON.stringify(theParams));
										return Promise.resolve(null);
									})
								}
							} else {
								//Promise.reject('fail to find spaceId!');
							}
						}
					}).then(function(){
						var rets = [];
						//console.log('6 theParams',JSON.stringify(theParams));
						return Promise.each(theParams,function(o){
							return that.findOrCreate({
								where: {
									userId: o.userId,
									roleId: o.roleId,
									spaceId: o.spaceId
								},
								defaults: {}
							}).spread(function(r,created){
								rets.push(r);
								return Promise.resolve(null);
							})
						}).then(function(){
							return Promise.resolve(rets);
						})
						//return that.bulkCreate(theParams);
					});
				}
			}
		
		}
	}
	);
}
