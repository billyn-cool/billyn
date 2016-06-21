'use strict';

import _ from 'lodash';

export default function (sequelize, DataTypes) {
  return sequelize.define('CircleSpace', {
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
    spaceId: {
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
