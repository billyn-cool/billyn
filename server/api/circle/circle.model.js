'use strict';

import _ from 'lodash';
import sqldb from '../../sqldb';
import treeTable from '../../sqldb/treeTable';
var Promise = require('bluebird');

export default function (sequelize, DataTypes) {
  return sequelize.define('Circle', {
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
		typeId: {
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
					var defaultCollabs;
					if (typeData.defaultCollabs) {
						defaultCollabs = typeData.defaultCollabs;
						delete typeData.defaultCollabs;
					}
					console.log('typeData:',JSON.stringify(typeData));
					if (typeData.name) {
						var tName = typeData.name;
						if (tName.indexOf('circle.') !== 0) {
							typeData.name = 'circle.' + tName;
						}
					}
					var Category = sqldb.Category;
					return Category.addType(typeData)/*.then(function (type) {
						if (defaultCollabs) {
							var Collab = sqldb.Collab;
							return Collab.bulkAdd(defaultCollabs);
						} else {
							return Promise.resolve(type);
						}
					})*/
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
						typeData.owner = 'circle';
						var tyName = typeData.name;
						if (tyName.substr(0, 4).toLowerCase() !== 'circle.') {
							tyName = 'circle.' + tyName;
						}
						typeData.name = tyName;
						//console.log('app model typeData:', JSON.stringify(typeData));
						return Category.getType(typeData, true);
					}

					//otherwise return promise reject
					sequelize.Promise.reject(new Error('fail to add type for circle!'));
				},
			},
		});
}
