'use strict';

import _ from 'lodash';

/*
 * this model define permit for operation on PermitAccount table, permit may include
 * pointPermit.allow.addPoint, pointPermit.allow.deductPoint, pointPermit.allow.cashing
 * sometime, may also limit to some app, space and event nut
 * for example: 
 * blynPoint is default point for space, can be added in each space, blow row should added for permit
 * {permit: allow.addPoint, nutId: blynPoint id, fromSpace : any, ...}
 */
export default function(sequelize, DataTypes) {
  return sequelize.define('PointPermit', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
	permitId: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
	nutId: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
	fromUserId: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
	fromRoleId: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
	fromNut: {
		type: DataTypes.STRING
	},
	formAppId: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
	fromSpaceId: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
	fromCircleId: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},	 
    active: DataTypes.BOOLEAN
  },{
	  classMethods: {
		  
	  },
  });
}
