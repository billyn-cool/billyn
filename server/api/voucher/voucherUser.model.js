'use strict';

import sqldb from '../../sqldb';
import _ from 'lodash';

export default function(sequelize, DataTypes) {
  return sequelize.define('VoucherUser', {
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
	voucherId: {
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
	status: {
		type: DataTypes.STRING
	},
    active: DataTypes.BOOLEAN
  },{
	  classMethods: {
		  
	  }
  });
}
