'use strict';

import _ from 'lodash';

export default function (sequelize, DataTypes) {
  return sequelize.define('CircleCollab', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
		circleId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		collabId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		creatorId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		joinStatus: {
			type: DataTypes.STRING,
			defaultValue: 'none'
		},
    active: DataTypes.BOOLEAN
  }, {
			classMethods: {
			},
		});
}
