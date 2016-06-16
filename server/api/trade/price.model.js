'use strict';

import _ from 'lodash';

export default function(sequelize, DataTypes) {
  return sequelize.define('Price', {
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
		price: {
			type: DataTypes.DECIMAL,
			defaultValue: -1
		},
		currency: DataTypes.STRING,
		owner: {
			type: DataTypes.STRING
		}, 
		ownerId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		}, 
		parentId: {
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
			active: DataTypes.BOOLEAN
		},{
			classMethods: {
				
			}
  });
}
