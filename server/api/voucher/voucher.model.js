'use strict';

import sqldb from '../../sqldb';
import treeTable from '../../sqldb/treeTable';
import _ from 'lodash';
var Promise = require("bluebird");

export default function (sequelize, DataTypes) {
	return sequelize.define('Voucher', {
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
		value: DataTypes.DECIMAL,
		description: DataTypes.STRING,
		status: DataTypes.STRING,
		spaceId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		circleId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		typeId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		productId: {
			type: DataTypes.INTEGER,
			defaultValue: -1
		},
		data: DataTypes.TEXT,
		active: DataTypes.BOOLEAN
	}, {
			getterMethods: {
				/*
				name: function(){
					return sqldb.Category.findById(this.typeId).then(function(type){
						return type.name
					});
				},
			  
				type: function(){
					return sqldb.Category.findById(this.typeId);
				}*/

			},
			classMethods: {

				addType: function (typeData) {

					var Category = sqldb.Category;
					if (!isNaN(typeData)) {
						return Category.findById(typeData);
					}
					var that = this;
					var spaceId = typeData.spaceId;
					var attributes;

					if (typeData.attributes) {
						attributes = typeData.attributes;
						delete typeData.attributes;
					}
					if (attributes) {
						return Category.getTypeRoot(typeData).then(function (typeRoot) {
							return typeRoot.addChild(typeData);
						}).then(function (type) {
							var newType = type;
							//console.log('voucher addType type:',JSON.stringify(type));
							return that.addAttributes(attributes, { owner: 'type', ownerId: type._id })
								.then(function (attrs) {
									return Promise.resolve(newType);
								})
						})
					} else {
						return Category.getTypeRoot(typeData).then(function (typeRoot) {
							return typeRoot.addChild(typeData);
						})
					}
				},
				getType: function (typeData, autoCreated) {
					//console.log('in space Category:', Category);
					//console.log('in space User:', User);
					//console.log('in space sqldb:', sqldb);
					var Category = sqldb.Category;
					var that = this;
					//var Category = sqldb.Category;
					//console.log('in space Category:', Category);
					if (!isNaN(typeData) && typeData > 0) {
						//console.log('1');
						return Category.findById(typeData)
							.then(function (type) {
								//console.log('2');
								//console.log('type:',JSON.stringify(type));
								return that.getAttributes({
									owner: 'voucherType',
									ownerId: type._id,
									spaceId: type.spaceId
								}).then(function (attributes) {
									//console.log('attributes:',JSON.stringify(attributes));
									type = JSON.parse(JSON.stringify(type));
									type.attributes = attributes;
									//console.log("voucher getType:",JSON.stringify(type));
									//type.attributes = Attribute.toObject(attributes);
									return Promise.resolve(type);
								});
							});
					}
					if (typeof typeData === 'string' && isNaN(typeData)) {
						var typeName = typeData;

						typeData = {};

						typeData.name = typeName;

						//console.log('in space getType');
						//console.log('in space Category:', Category);
						//console.log('space getType typeData:', JSON.stringfy(typeData));
					}

					if (typeof typeData === 'object' && !_.isEmpty(typeData)) {
						typeData.owner = 'voucher';
						var tyName = typeData.name || 'voucher';
						if (tyName.substr(0, 7).toLowerCase() !== 'voucher') {
							tyName = 'voucher.' + tyName;
						}
						typeData.name = tyName;
						//console.log('space model typeData:', JSON.stringify(typeData));
						return Category.getType(typeData, autoCreated)
							.then(function (type) {
								return that.getAttributes({
									owner: 'voucherType',
									ownerId: type._id,
									spaceId: type.spaceId
								}).then(function (attributes) {
									//console.log('attributes :',JSON.stringify(attributes));
									type = JSON.parse(JSON.stringify(type));
									type.attributes = attributes;
									//type.attributes = Attribute.toObject(attributes);
									return Promise.resolve(type);
								});
							});
					}

					//otherwise return promise reject
					sequelize.Promise.reject(new Error('fail to add voucher type!'));
				},

				getTypes: function (typeData) {

					var Category = sqldb.Category;

					if (typeData.spaceId && !isNaN(typeData.spaceId) && typeData.spaceId > 0) {
						return this.getType({ spaceId: typeData.spaceId, name: 'voucher' }, true).then(function (type) {
							//console.log('getTypes type:',JSON.stringify(type));
							//console.log('getTypes type:',JSON.stringify(type));
							return type.getChildren('leaf').then(function (children) {
								//console.log('getTypes children:',JSON.stringify(children));
								return Promise.resolve(children);
							})
						});
					}

					//otherwise return promise reject
					sequelize.Promise.reject(new Error('fail to get voucher types!'));
				},

				addAttributes: function (attributeData, ownerData) {

					//console.log('voucher model attributeData:',JSON.stringify(attributeData));
					if (typeof attributeData === 'object' && !Array.isArray(attributeData)) {
						var oList = [];
						for (var key in attributeData) {
							oList.push({ name: key, value: attributeData[key] });
						}
						attributeData = oList;
					}

					var that = this;

					return Promise.each(attributeData, function (attr) {
						//console.log('voucher model attr:',JSON.stringify(attr));
						return that.addAttribute(attr, ownerData);
					});
				},
				addAttribute: function (attrData, ownerData) {

					var Attribute = sqldb.Attribute;

					if (typeof attrData === 'object' && !_.isEmpty(attrData)) {
						if (!attrData.owner) {
							attrData.owner = 'voucher';
						}

						if (!attrData.name) {
							attrData.name = 'voucher';
						}

						if (typeof ownerData === 'number') {
							attrData.ownerId = ownerData;
						}

						if (typeof ownerData === 'object' && ownerData._id) {
							attrData.ownerId = ownerData._id;
						}

						if (typeof ownerData === 'object' && ownerData.owner) {
							attrData.owner = ownerData.owner;
						}

						if (typeof ownerData === 'object' && ownerData.ownerId) {
							attrData.ownerId = ownerData.ownerId;
						}

						if (attrData.name) {
							var aName = attrData.name;
							if (aName.indexOf('voucher.') !== 0 && attrData.owner === 'voucher') {
								attrData.name = 'voucher.' + aName;
							}
						}

						//var attrName = attrData.name;
						//if(attrName.substr(0,7).toLowerCase() !== 'voucher'){
						//attrName = 'voucher.' + attrName;
						//}
						//attrData.name = attrName;
						//console.log('space model typeData:', JSON.stringify(typeData));
						return Attribute.addAttribute(attrData);
					}

					//otherwise return promise reject
					sequelize.Promise.reject(new Error('fail to add voucher attribute!'));
				},
				getAttributes: function (attrData) {

					var Attribute = sqldb.Attribute;

					return Attribute.getAttributes(attrData);

				},
				getAttribute: function (attrData) {

					var Attribute = sqldb.Attribute;

					return Attribute.getAttribute(attrData);

				},
				add: function (voucherData) {
					//console.log('2 voucherData:',JSON.stringify(voucherData));
					var that = this;
					var Category = sqldb.Category;
					var Role = sqldb.Role;
					var Attribute = sqldb.Attribute;
					var Timeslot = sqldb.Timeslot;
					var attributeData = [];
					var spaceId;

					var newType, newVoucher, grants, timeslots, minExpense, minMembers;

					if (voucherData.spaceId) {
						spaceId = voucherData.spaceId;
					}

					var typeData = {//default type
						name: 'normal',
						spaceId: voucherData.spaceId
					};

					if (voucherData.type) {
						typeData = voucherData.type;
						typeData.spaceId = voucherData.spaceId;
						delete voucherData.type;
					}
					if (voucherData.typeId) {
						typeData = voucherData.typeId;
					}
					if (voucherData.timeslots) {
						timeslots = voucherData.timeslots;
						delete voucherData.timeslots;

						for (var tKey in timeslots) {
							var oTimeSlot = timeslots[tKey];
							//console.log('oTimeSlot:',JSON.stringify(oTimeSlot));
							for (var oKey in oTimeSlot) {
								attributeData.push({
									name: 'timeslot.' + tKey + '.' + oKey,
									value: oTimeSlot[oKey],
									spaceId: spaceId,
									owner: 'voucher'
								});
							}
						}
					}
					if (voucherData.grants) {
						grants = voucherData.grants;
						delete voucherData.grants;

						for (var key in grants) {
							attributeData.push({
								name: 'grant.' + key,
								value: grants[key],
								spaceId: spaceId,
								owner: 'voucher'
							});
						}
					}
					if (voucherData.minMembers) {
						attributeData.push({
							name: 'minMembers',
							value: voucherData.minMembers,
							spaceId: spaceId,
							owner: 'voucher'
						});
						delete voucherData.minMembers;
					}
					if (voucherData.minExpense) {
						attributeData.push({
							name: 'minExpense.amount',
							value: voucherData.minExpense.amount,
							spaceId: spaceId,
							owner: 'voucher'
						});
						attributeData.push({
							name: 'minExpense.currency',
							value: voucherData.minExpense.currency,
							spaceId: spaceId,
							owner: 'voucher'
						});
						delete voucherData.minExpense;
					}
					return that.addType(typeData).then(function (type) {
						//console.log('voucher model addType:', JSON.stringify(type));
						newType = type;
						var whereData = {};
						if (voucherData.name) {
							whereData.name = voucherData.name;
						}
						if (voucherData.spaceId) {
							whereData.spaceId = voucherData.spaceId
						}
						whereData.typeId = type._id;
						return that.findOrCreate({
							where: whereData,
							defaults: voucherData
						})
					}).spread(function (voucher, created) {
						//console.log('voucher model voucher:', JSON.stringify(voucher));
						//convert readonly voucher to writable
						newVoucher = JSON.parse(JSON.stringify(voucher));

						newVoucher.type = newType;

						//console.log('newVoucher:',JSON.stringify(newVoucher));
						if (!_.isEmpty(attributeData)) {
							//newVoucher.attributes = attributeData;
							attributeData.forEach(function (a) {
								a.ownerId = voucher._id;
							});

							//console.log('ar:',JSON.stringify(ar));

							//newVoucher.attributes = ar;
							//console.log('attributeData:',JSON.stringify(attributeData));
							return that.addAttributes(attributeData);
						} else {
							return Promise.resolve(null);
						}
					}).then(function () { //addGrants
						//console.log('newVoucher:','newVoucher:'+JSON.stringify(newVoucher));
						if (!_.isEmpty(grants)) {
							//console.log('2 grants:',JSON.stringify(grants));
							//newVoucher.grants = grants;
							//console.log('Role:',Role);
							return Role.addGrants(grants, { spaceId: spaceId, owner: 'voucher', ownerId: newVoucher._id });
						} else {
							return Promise.resolve(null);
						}
					}).then(function () {
						//console.log('timeslots:', JSON.stringify(timeslots));
						//if (!_.isEmpty(timeslots)) {
							//newVoucher.timeslots = timeslots;
							//console.log('2 timeslots:', JSON.stringify(timeslots));
							//return Timeslot.addTimeslots(timeslots, { spaceId: spaceId, owner: 'voucher', ownerId: newVoucher._id });
						//} else {
							return Promise.resolve(null);
						//}
					}).then(function () {
						that.hasMany(Attribute, { foreignKey: "ownerId", as: "attributes" });
						that.belongsTo(Category,{as:'type'});
						return that.find({
							where: {
								_id: newVoucher._id
							},
							include: [
								{
									model: Category, as: 'type'
								},
								{
									model: Attribute, as: "attributes",
									where: {
										value: {
											$ne: null
										}
									}
								}]
						});
					});
				},
				bulkAdd: function (vouchers) {
					
					var that = this;
					var list = [];
					
					return Promise.each(vouchers,function(v){
						//console.log('bulkAdd voucherData:', JSON.stringify(v));
						return that.add(v).then(function(voucher){
							list.push(voucher);
						});
					}).then(function(){
						return Promise.resolve(list);
					});
				}
			},
		});
}
