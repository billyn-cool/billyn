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
	alias: DataTypes.STRING,
	description: DataTypes.STRING,
	price: {
		type: DataTypes.DECIMAL,
		defaultValue: -1
	},
	currency: DataTypes.STRING,
	changeAmount: {
		type: DataTypes.DECIMAL,
		defaultValue: 0
	},
	changeMode:  {
		type: DataTypes.ENUM('add','deduct'),
		defaultValue: 'deduct'
	},
	changeUnit: {
		type: DataTypes.STRING,
		defaultValue: 'currency'
	},
	ownerType: {
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
