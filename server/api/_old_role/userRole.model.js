'use strict';

import _ from 'lodash';
var Promise = require("bluebird");
import TreeTable from '../../sqldb/treeTable';

export default function(sequelize, DataTypes) {
	return sequelize.define('UserRole', {
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
		roleId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		spaceId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		active: DataTypes.BOOLEAN
	});
}
