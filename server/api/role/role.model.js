'use strict';

import _ from 'lodash';
var Promise = require("bluebird");
import TreeTable from '../../sqldb/treeTable';
import {UserRole} from '../../sqldb/';
import {User} from '../../sqldb/';
import {Space} from '../../sqldb/';
import {Permit} from '../../sqldb/';
import sqldb from '../../sqldb';

export default function (sequelize, DataTypes) {
  return sequelize.define('Role', {
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
    spaceId: {
      type: DataTypes.INTEGER,
      defaultValue: -1
    },
    appId: {
      type: DataTypes.INTEGER,
      defaultValue: -1
    },
    name: DataTypes.STRING,
    alias: DataTypes.STRING,
    fullname: DataTypes.STRING,
    owner: DataTypes.STRING,
    ownerId: {
      type: DataTypes.INTEGER,
      defaultValue: -1
    },
    active: DataTypes.BOOLEAN
  }, {
      getterMethods: {
        roleName: function () {
          if (this.fullname !== 'root.role') {
            return this.fullname.slice(10);
          }
        },
        name: function () {
          if (this.fullname !== 'root.role') {
            return this.fullname.slice(10);
          }
        }
      },
      classMethods: {
        getRoot: function () {
          return this
            .findOrCreate({
              where: {
                name: 'root',
                fullname: 'root'
              },
              defaults: {
                alias: 'root'
              }
            })
            .spread(function (entity, created) {
              return Promise.resolve(entity);
            });
        },
        getRoleRoot: function (roleData) {

          //return this.getRoot();

          var Model = this;

          ///*
          return this.getRoot().then(function (root) {
            var whereData = {};

            if (typeof roleData === 'object') {
              for (var key in roleData) {
                if (key.toLowerCase() === 'owner' || key.toLowerCase() === 'ownertype') {
                  whereData.owner = roleData[key];
                  //delete roleData[key];
                }
                if (key.toLowerCase() === 'spaceid') {
                  whereData.spaceId = roleData[key];
                  //delete roleData[key];
                }
                if (key.toLowerCase() === 'appid') {
                  whereData.appId = roleData[key];
                  //delete roleData[key];
                }
                if (key.toLowerCase() === 'ownerid') {
                  whereData.ownerId = roleData[key];
                  //delete roleData[key];
                }
              }
            }

            whereData.name = 'role';
            whereData.fullname = 'root.role';
            whereData.parentId = 1;

            //console.log('getRoleRoot root: ', JSON.stringify(root));

            //console.log('getRoleRoot whereData: ', JSON.stringify(whereData));

            return Model.findOrCreate({
              where: whereData,
              defaults: {
                alias: 'role'
              }
            })
              .spread(function (entity, created) {
                //console.log('getRoleRoot created: ', created);
                return Promise.resolve(entity);
              });
          });
        },
        getCustomer: function (context) {
          return this.getRoleRoot(context).getChild('customer');
        },
        getMember: function (context) {
          return this.getRoleRoot(context).getChild('member');
        },
        getAdmin: function (context) {
          return this.getRoleRoot(context).getChild('admin');
        },
        getUserRoles: function (context) {
          var whereData = {};
          if (typeof context === 'object') {
            for (var key in context) {
              if (key.toLowerCase() === 'spaceid' || key.toLowerCase() === 'userid') {
                whereData.spaceId = context[key];
              }
            }
          }

          if (whereData.hasOwnProperty('spaceId') && whereData.hasOwnProperty('userId')) {
            UserRole.belongsTo(User);
            UserRole.belongsTo(Space);
            UserRole.belongsTo(Role);
            return UserRole.findAll({
              include: [{ all: true }],
              where: whereData
            })
          }

          //otherwhise, return error
          return Promise.reject(new Error('fail to find users, make sure userId | spaceId is provided!'));
        },
        findAllUserSpaceRole: function (userId, spaceId) {
          //console.log('userId:',userId);
          //console.log('spaceId:',spaceId);

          if (!userId) {     
            Promise.reject('please provide userId!');
          }

          if (!spaceId) {           
            Promise.reject('please provide spaceId!');
          }

          var UserRole = sqldb.UserRole;
          var Category = sqldb.Category;
          var Space = sqldb.Space;
          var that = this;
          var theRoles;

          that.hasMany(UserRole);
          that.belongsTo(Space, { as: 'space' });
          Space.belongsTo(Category, { as: 'type' });

          return that.findAll({
            where: {
              spaceId: spaceId,
            },
            include: [
              {
                model: UserRole,
                where: {
                  userId: userId
                }
              },
              {
                  model: Space, as: 'space',
                  include: [
                    {
                      model: Category, as: 'type'
                    }
                  ]
                }
            ]
            //add everyone role for each user roles
          }).then(function (roles) {
            //console.log('roles', JSON.stringify(roles));
            theRoles = roles;
            return that.find({
              where: {
                spaceId: spaceId,
                name: 'everyone'
              },
              include: [
                {
                  model: Space, as: 'space',
                  include: [
                    {
                      model: Category, as: 'type'
                    }
                  ]
                },
                
              ]
            }).then(function (role) {
              theRoles.push(role);
              return Promise.resolve(theRoles);
            })
          })
        },
        addRole: function (context) {
          if (typeof context === 'string' && parseInt(context) > 0) {
            return this.findById(context);
          }
          if (typeof context === 'object' && context.roleId && context.roleId > 0) {
            return this.findById(context.roleId);
          }
          var treeObj = new TreeTable();
          return this.getRoleRoot(context).then(function (root) {
            //console.log('getRoleRoot:', JSON.stringify(root));
            return treeObj.addChild(root, context);
          });
        },
        add: function (roleData) {
          return this.addRole(roleData);
        },
        getRole: function (roleData) {
          var that = this;
          if (roleData && !isNaN(roleData)) {
            return that.findById(roleData);
          }

          if (typeof roleData === 'object') {
            return this.getRoleRoot(roleData).then(function (root) {
              return root.getChild(roleData);
            });
          }
        },
        getRoles: function (roleData) {
          var that = this;
          return this.getRoleRoot(roleData).then(function (root) {
            return root.getChildren('all');
          });
        },
        /**
         * grandsData format: 
         * [
         *    {roleName|roleAlias:'permitName|permitAlias,....'}
         * ]
         */
        addGrants: function (grantsData, ownerData) {
          //console.log('in Role.addGrants');

          //console.log('role model grantsData:',JSON.stringify(grantsData));
          //console.log('addGrants spaceId:',spaceId);
          //console.log('role model ownerData:',JSON.stringify(ownerData));

          var grants = [];

          for (var key in grantsData) {
            var o = {};
            o[key] = grantsData[key];
            grants.push(o);
          }

          var that = this;
          var count = 0;

          //console.log('addGrants grants:',JSON.stringify(grants));

          return Promise.each(grants, function (grantData) {
            //console.log('role model grantData:',JSON.stringify(grantData));
            count++;
            return that.addGrant(grantData, ownerData);
          }).then(function () {
            return count;
          });

        },
        //grantData format: {roleName|roleAlias: permitList}
        //permitList format: 'permitName|permitAlias,....'
        addGrant: function (grantData, ownerData) {

          //console.log('addGrant ownerData:',JSON.stringify(ownerData));

          var roleData;

          for (var key in grantData) {
            var aList = key.split("|");
            roleData = {
              name: aList[0],
              alias: aList[0]|aList[0],
              spaceId: ownerData.spaceId
            };
            var permitList = grantData[key].split(",");
          }

          //console.log('permitList',JSON.stringify(permitList));
          //console.log('addGrant roleData',JSON.stringify(roleData));

          var theRole, thePermit;

          return this.addRole(roleData).then(function (role) {

            theRole = role;

            var count = 0;

            return Promise.each(permitList, function (pName) {
              var permitData = Object.assign({}, ownerData);
              var pList = pName.split("|");
              permitData.name = pList[0];
              permitData.alias = pList[1]|pList[0];
              count++;
              //console.log('permitData',JSON.stringify(permitData));
              return sqldb.Permit.addPermit(permitData).then(function (permit) {
                var whereData = {};

                whereData.spaceId = ownerData.spaceId,
                  whereData.owner = ownerData.owner,
                  whereData.ownerId = ownerData.ownerId
                whereData.permitId = permit._id;
                whereData.roleId = theRole._id;

                //console.log('whereData:',JSON.stringify(whereData));
                //console.log('ownerData:',JSON.stringify(ownerData));

                return sqldb.PermitRole.findOrCreate({
                  where: whereData,
                  defaults: {}
                });
              });
            });
          });
        }
      },
      instanceMethods: {
        addChild: function (childData) {
          var treeObj = new TreeTable();
          return treeObj.addChild(this, childData);
        },
        getChildren: function (childData) {
          var treeObj = new TreeTable();
          return treeObj.getChildren(this, childData);
        },
        getChild: function (childData) {
          var treeObj = new TreeTable();
          return treeObj.getChild(this, childData);
        },
        getParent: function (recursive) {
          var treeObj = new TreeTable();
          return treeObj.getParent(this, recursive);
        },
        childCount: function () {
          var treeObj = new TreeTable();
          return treeObj.childCount(this);
        },
        isParentOf: function (childObj, recursive) {
          var treeObj = new TreeTable();
          return treeObj.isParentOf(childObj, this, recursive);
        },
        isChildOf: function (parentObj, recursive) {
          var treeObj = new TreeTable();
          return treeObj.isChildOf(parentObj, this, childData);
        }
      }
    });
}
