'use strict';

import _ from 'lodash';
var Promise = require("bluebird");
import TreeTable from '../../sqldb/treeTable';

export default function (sequelize, DataTypes) {
  return sequelize.define('Permit', {
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
    value: DataTypes.STRING,
    owner: DataTypes.STRING,
    ownerId: {
      type: DataTypes.INTEGER,
      defaultValue: -1
    },
    active: DataTypes.BOOLEAN
  }, {
    getterMethods: {
      permitName: function () {
        var fname = this.fullname;
        var fname2 = fname.slice(fname.indexOf('.') + 1);
        return fname2.slice(fname2.indexOf('.') + 1);
      },
      name: function () {
        var fname = this.fullname;
        var fname2 = fname.slice(fname.indexOf('.') + 1);
        return fname2.slice(fname2.indexOf('.') + 1);
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
      getPermitRoot: function (permitData) {
        
        //return this.getRoot();

        var Model = this;

        ///*
        return this.getRoot().then(function (root) {
          var whereData = {};

          if (typeof permitData === 'object') {
            for (var key in permitData) {
              if (key.toLowerCase() === 'owner' || key.toLowerCase() === 'ownertype') {
                whereData.owner = permitData[key];
                //delete permitData[key];
              }
              if (key.toLowerCase() === 'spaceid') {
                whereData.spaceId = permitData[key];
                //delete permitData[key];
              }
              if (key.toLowerCase() === 'appid') {
                whereData.appId = permitData[key];
                //delete permitData[key];
              }
              if (key.toLowerCase() === 'ownerid') {
                whereData.ownerId = permitData[key];
                //delete permitData[key];
              }
            }
          }

          whereData.name = 'permit';
          whereData.fullname = 'root.permit';
          whereData.parentId = 1;

          //console.log('getPermitRoot root: ', JSON.stringify(root));

          //console.log('getPermitRoot whereData: ', JSON.stringify(whereData));

          return Model.findOrCreate({
              where: whereData,
              defaults: {
                alias: 'permit'
              }
            })
            .spread(function (entity, created) {
              //console.log('getPermitRoot created: ', created);
              return Promise.resolve(entity);
            });
        });
      },
      //this function like findOrCreate
      /*
      addPermit: function (permitData) {

        var permitName;
        var owner;
        var ownerId;
        var spaceId;
        var appId;

        console.log('Permit model permitData:',permitData);

        if (typeof permitData === 'string') {
          permitName = permitData;
          permitData = {};
          permitData.name = permitName;
        }

        if (typeof permitData === 'object') {
          //console.log('permitData 2: ', permitData);
          for (var key in permitData) {
            if (key.toLowerCase() === 'name' || key.toLowerCase() === 'permitname') {
              permitName = permitData[key];
              delete permitData[key];
            }
            if (key.toLowerCase() === 'owner') {
              owner = permitData[key];
              delete permitData[key];
            }
            if (key.toLowerCase() === 'ownerid') {
              ownerId = permitData[key];
              delete permitData[key];
            }
            if (key.toLowerCase() === 'spaceid') {
              spaceId = permitData[key];
              delete permitData[key];
            }
            if (key.toLowerCase() === 'appid') {
              appId = permitData[key];
              delete permitData[key];
            }
          }
        }
        //console.log('permitName:',permitName);

        var permitContext = {};

        if (owner) {
          permitContext.owner = owner;
        }
        if (ownerId && ownerId !== -1) {
          permitContext.ownerId = ownerId;
        }
        if (spaceId && spaceId !== -1) {
          permitContext.spaceId = spaceId;
        }
        if (appId && appId !== -1) {
          permitContext.appId = appId;
        }

        if (permitName) {
          var names = permitName.split('.');
          //console.log('names:', names);
          //console.log('permitData:',permitData);
          //console.log('permitContext:',permitContext);

          var Model = this;

          return this.getPermitRoot(permitContext)
            .then(function (permitRoot) {
              //console.log('permitRoot:',permitRoot);
              var parentId = permitRoot.parentId;
              var fullname = permitRoot.fullname;
              var finalPermit;
              return Promise.reduce(names, function (finalPermit, tName) {
                  permitData.alias = permitData.alias || tName;
                  permitContext.name = tName;
                  permitContext.fullname = fullname + '.' + tName;
                  permitContext.parentId = parentId;
                  //console.log('name: ',tName);
                  //console.log('fullName: ',fullname);
                  //console.log('parentId: ',parentId);
                  //console.log('permitContext',JSON.stringify(permitContext));
                  return Model.findOrCreate({
                      where: permitContext,
                      defaults: permitData
                    })
                    .spread(function (thePermit, created) {
                      parentId = thePermit.parentId;
                      fullname = thePermit.fullname;
                      return finalPermit = thePermit;
                      //console.log('finalPermit:', finalPermit);
                      //Promise.resolve(finalPermit);
                    });
                }, 0)
                .then(function (finalPermit) {
                  //console.log('promise.map finalPermit: ',finalPermit);
                  return Promise.resolve(finalPermit);
                });
            });
        }

        return Promise.reject(new Error('fail to add permit!'));
      },*/
      addPermit: function (permitData) {

        //console.log('Permit model permitData:',permitData);

        var treeObj = new TreeTable();
         return this.getPermitRoot(permitData).then(function (permitRoot) {
           //console.log('permitRoot:',JSON.stringify(permitRoot));
            return treeObj.addChild(permitRoot,permitData).then(function (child) {
              //console.log("permit model child:",JSON.stringify(child));
              return Promise.resolve(child);
            }); 
         }); 
      },
      getPermit: function (permitData) {
        var that = this;
        if ( permitData && !isNaN(permitData)){
          return that.findById(permitData);
        }

        if( typeof permitData === 'object'){
          return this.getPermitRoot(permitData).then(function(permitRoot){
            return permitRoot.getChild(permitData);
          });
        }
      },
      /*
      getPermit: function (permitData) {
        var whereData = {};
        if (typeof permitData === 'object') {
          for (var key in permitData) {
            if (key.toLowerCase() === 'spaceid') {
              whereData.spaceId = permitData[key];
            }
          }
        }
        if (whereData.hasOwnProperty('spaceId') && whereData.hasOwnProperty('appId')) {
          return this.findAll({
            include: [{all: true}],
            where: whereData
          })
        }
      },*/
      getPermits: function () {
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
