'use strict';

import _ from 'lodash';

export default function(sequelize, DataTypes) {
  return sequelize.define('PointAccount', {
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
	ownerType: DataTypes.STRING,
	ownerId: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
	spaceId: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
	circleId: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
	typeId: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN
  },{
	  classMethods: {
		  
	  },
  });
}
