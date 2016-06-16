'use strict';

import sqldb from '../../sqldb';
import _ from 'lodash';

export default function(sequelize, DataTypes) {
  return sequelize.define('ProductSpec', {
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
    name: {
      type: DataTypes.STRING
    },
		fullname: {
      type: DataTypes.STRING
    },
		alias: DataTypes.STRING,
		value: DataTypes.STRING,
		description: DataTypes.STRING,
		data: DataTypes.TEXT,
		owner: DataTypes.STRING,
		ownerId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		spaceId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		typeId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		active: DataTypes.BOOLEAN
  },{
	  classMethods: {
		  
	  },
  });
}
