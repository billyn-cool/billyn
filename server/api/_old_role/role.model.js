'use strict';

import _ from 'lodash';
var Promise = require("bluebird");
import TreeTable from '../../sqldb/treeTable';
import {UserRole} from '../../sqldb/';
import {User} from '../../sqldb/';
import {Space} from '../../sqldb/';

export default function(sequelize, DataTypes) {
	return sequelize.define('Role', {
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
			roleName: function(){
				return this.fullname.slice(5);
			},
			name: function(){
				return this.fullname.slice(5);
			}
		},
		classMethods: {
			getRoot: function() {
				return this
					.findOrCreate({
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
			},
			getCustomer: function(context) {

				//console.log('in getTypeRoot typeData:', typeData);

				var Model = this;

				return this.getRoot().then(function(root) {
					var whereData = {};

					if (typeof context === 'object') {
						for (var key in context) {
							if (key.toLowerCase() === 'owner' || key.toLowerCase() === 'ownertype') {
								whereData.owner = context[key];
							}
							if (key.toLowerCase() === 'appid' || key.toLowerCase() === 'spaceid' || key.toLowerCase() === 'ownerid') {
								whereData.owner = context[key];
							}
						}
					}

					whereData.name = 'customer';
					whereData.fullname = 'root.customer';
					whereData.parentId = 1;

					//console.log('getTypeRoot root: ', JSON.stringify(root));

					//console.log('getTypeRoot whereData: ', JSON.stringify(whereData));

					return Model.findOrCreate({
						where: whereData,
						defaults: {
							alias: 'customer'
						}
					})
						.spread(function(entity, created) {
							//console.log('getTypeRoot created: ', created);
							return Promise.resolve(entity);
						});
				});

			},
			getMember: function(context) {

				var Model = this;

				return this.getRoot().then(function(root) {
					var whereData = {};

					if (typeof context === 'object') {
						for (var key in context) {
							if (key.toLowerCase() === 'owner' || key.toLowerCase() === 'ownertype') {
								whereData.owner = context[key];
							}
							if (key.toLowerCase() === 'appid' || key.toLowerCase() === 'spaceid' || key.toLowerCase() === 'ownerid') {
								whereData.owner = context[key];
							}
						}
					}

					whereData.name = 'member';
					whereData.fullname = 'root.member';
					whereData.parentId = 1;

					return Model.findOrCreate({
						where: whereData,
						defaults: {
							alias: 'member'
						}
					})
						.spread(function(entity, created) {
							return Promise.resolve(entity);
						});
				});
			},
			getAdmin: function(context) {

				var Model = this;

				return this.getRoot().then(function(root) {
					var whereData = {};

					if (typeof context === 'object') {
						for (var key in context) {
							if (key.toLowerCase() === 'owner' || key.toLowerCase() === 'ownertype') {
								whereData.owner = context[key];
								//delete categoryData[key];
							}
							if (key.toLowerCase() === 'appid' || key.toLowerCase() === 'spaceid' || key.toLowerCase() === 'ownerid') {
								whereData.owner = context[key];
								//delete categoryData[key];
							}
						}
					}

					whereData.name = 'admin';
					whereData.fullname = 'root.admin';
					whereData.parentId = 1;

					return Model.findOrCreate({
						where: whereData,
						defaults: {
							alias: 'admin'
						}
					})
						.spread(function(entity, created) {
							return Promise.resolve(entity);
						});
				});
			},
			getUserRoles: function(context) {
				var whereData = {};
				if(typeof context === 'object'){
					for(var key in context){
						if( key.toLowerCase() === 'spaceid' || key.toLowerCase() === 'userid'){
							whereData.spaceId = context[key];
						}
					}
				}
				
				if(whereData.hasOwnProperty('spaceId') && whereData.hasOwnProperty('appId')){
					UserRole.belongsTo(User);
					UserRole.belongsTo(Space);
					UserRole.belongsTo(Role);
					return UserRole.findAll({
						include: [{all: true}],
						where: whereData
					})
				}
				
				//otherwhise, return error
				return Promise.reject(new Error('fail to run function!'));
			}
		},
		instanceMethods:{
			addChild: function(childData){
				var treeObj = new TreeTable();
				return treeObj.addChild(this,childData);
			},
			getChildren: function(childData){
				var treeObj = new TreeTable();
				return treeObj.getChildren(this,childData);
			},
			getChild: function(childData){
				var treeObj = new TreeTable();
				return treeObj.getChild(this,childData);
			},
			getParent: function(recursive){
				var treeObj = new TreeTable();
				return treeObj.getParent(this,recursive);
			},
			childCount: function(){
				var treeObj = new TreeTable();
				return treeObj.childCount(this);
			},
			isParentOf: function(childObj,recursive){
				var treeObj = new TreeTable();
				return treeObj.isParentOf(childObj,this,recursive);
			},
			isChildOf: function(parentObj,recursive){
				var treeObj = new TreeTable();
				return treeObj.isChildOf(parentObj,this,childData);
			}
		}
	});
}
