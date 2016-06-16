'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('SpaceApp', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    spaceId: DataTypes.INTEGER,
	appId: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN
  });
}
