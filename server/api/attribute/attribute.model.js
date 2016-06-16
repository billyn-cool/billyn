'use strict';

import _ from 'lodash';
var Promise = require("bluebird");
import TreeTable from '../../sqldb/treeTable';

export default function (sequelize, DataTypes) {
  return sequelize.define('Attribute', {
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
    value: DataTypes.STRING,
    fullname: DataTypes.STRING,
    owner: DataTypes.STRING,
    ownerId: {
      type: DataTypes.INTEGER,
      defaultValue: -1
    },
    active: DataTypes.BOOLEAN
  }, {
    getterMethods: {
      // attributeName: function () {
      //   var fname = this.fullname;
      //   //console.log('fname:', fname);
      //   var fname2 = fname.slice(fname.indexOf('.') + 1);
      //   //console.log('fname2:', fname2);
      //   return fname2.slice(fname2.indexOf('.') + 1);
      // },
      attributeName: function () {
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
      getAttributeRoot: function (attributeData) {

        //console.log('in getAttributeRoot attributeData:', attributeData);

        var Model = this;
        //var attributeData = attrData;

        return this.getRoot().then(function (root) {
          var whereData = {};

          if (typeof attributeData === 'object') {
            for (var key in attributeData) {
              if (key.toLowerCase() === 'owner' || key.toLowerCase() === 'ownerattribute') {
                whereData.owner = attributeData[key];
                //delete attributeData[key];
              }
              if (key.toLowerCase() === 'ownerid') {
                whereData.ownerId = attributeData[key];
                //delete attributeData[key];
              }
              if (key.toLowerCase() === 'spaceid') {
                whereData.spaceId = attributeData[key];
                //delete attributeData[key];
              }
              if (key.toLowerCase() === 'appid') {
                whereData.appId = attributeData[key];
                //delete attributeData[key];
              }
            }
          }

          whereData.name = 'attributeRoot';
          whereData.fullname = 'root.attributeRoot';
          whereData.parentId = 1;

          //console.log('getAttributeRoot root: ', JSON.stringify(root));

          //console.log('getAttributeRoot whereData: ', JSON.stringify(whereData));

          return Model.findOrCreate({
              where: whereData,
              defaults: {
                alias: 'attributeRoot'
              }
            })
            .spread(function (entity, created) {
              //console.log('getAttributeRoot created: ', created);
              return Promise.resolve(entity);
            });
        });
      },
      addAttribute: function (attributeData) {

        var attributeName;
        var owner;
        var ownerId;
        var spaceId;
        var appId;

        //console.log('attributeData:',attributeData);

        if (typeof attributeData === 'string') {
          attributeName = attributeData;
          attributeData = {};
          attributeData.name = attributeName;
        }

        if (typeof attributeData === 'object') {
          //console.log('attributeData 2: ', attributeData);
          for (var key in attributeData) {
            if (key.toLowerCase() === 'name' || key.toLowerCase() === 'attributename') {
              attributeName = attributeData[key];
              delete attributeData[key];
            }
            if (key.toLowerCase() === 'owner') {
              owner = attributeData[key];
              delete attributeData[key];
            }
            if (key.toLowerCase() === 'ownerid') {
              ownerId = attributeData[key];
              delete attributeData[key];
            }
            if (key.toLowerCase() === 'spaceid') {
              spaceId = attributeData[key];
              delete attributeData[key];
            }
            if (key.toLowerCase() === 'appid') {
              appId = attributeData[key];
              delete attributeData[key];
            }
          }
        }
        //console.log('attributeName:',attributeName);

        var attributeContext = {};

        if (owner) {
          attributeContext.owner = owner;
        }
        if (ownerId && ownerId !== -1) {
          attributeContext.ownerId = ownerId;
        }
        if (spaceId && spaceId !== -1) {
          attributeContext.spaceId = spaceId;
        }
        if (appId && appId !== -1) {
          attributeContext.appId = appId;
        }

        if (attributeName) {
          var names = attributeName.split('.');
          //console.log('names:', names);
          //console.log('attributeData:',attributeData);
          //console.log('attributeContext:',attributeContext);

          var Model = this;

          return this.getAttributeRoot(attributeContext)
            .then(function (attributeRoot) {
              //console.log('attributeRoot:',attributeRoot);
              var parentId = attributeRoot._id;
              var fullname = attributeRoot.fullname;
              var finalAttribute;
              var i = 0;
              return Promise.reduce(names, function (finalAttribute, tName) {
                  //attributeData.alias = attributeData.alias || tName;
                  attributeContext.name = tName;
                  attributeContext.fullname = fullname + '.' + tName;
                  attributeContext.parentId = parentId;
                  //console.log('name: ',tName);
                  //console.log('fullName: ',fullname);
                  //console.log('parentId: ',parentId);
                  //console.log('attributeContext',JSON.stringify(attributeContext));
                  var defaults = {};
                  if(i++ === names.length - 1){
                    attributeData.alias = attributeData.alias || attributeName;
                    defaults = attributeData
                  }               
                  return Model.findOrCreate({
                      where: attributeContext,
                      defaults: defaults
                    })
                    .spread(function (theAttribute, created) {
                      parentId = theAttribute._id;
                      fullname = theAttribute.fullname;
                      return finalAttribute = theAttribute;
                      //console.log('finalAttribute:', finalAttribute);
                      //Promise.resolve(finalAttribute);
                    });
                }, 0)
                .then(function (finalAttribute) {
                  //console.log('promise.map finalAttribute: ',finalAttribute);
                  return Promise.resolve(finalAttribute);
                });
            });
        }

        return Promise.reject(new Error('fail to add attribute!'));
      },
      getAttribute: function (attributeData) {

        if(!isNaN(attributeData) && attributeData > 0){
          return this.findById(attributeData);
        }
        //console.log('getAttribute attributeContext:', JSON.stringify(attributeContext));
        return this.getAttributeRoot(attributeData).then(function (attrRoot) {
          //console.log('getAttributes attrRoot:', JSON.stringify(attrRoot));
          return attrRoot.getChild(attributeData);
        });
      },
      getAttributes: function (attributeContext) {
        //console.log('getAttribute attributeContext:', JSON.stringify(attributeContext));
        return this.getAttributeRoot(attributeContext).then(function (attrRoot) {
          //console.log('getAttributes attrRoot:', JSON.stringify(attrRoot));
          return attrRoot.getChildren({mode: 'leaf'});
        });
      },
      //name format: a1.b1.c1
      addAttributes: function (attributesData) {
        var newAttrs = [];
        Promise.each(attributesData, function (attributeData) {
          this.addAttribute(attributeData).then(function (attr) {
            newAttrs.push(attr);
          })
        });
        return Promise.resolve(newAttrs);
      },

      toObject: function(attributes){

        //console.log('toObject attibutes:',JSON.stringify(attribute));

        var theObjec = {};

        attributes.forEach(function(attribute){
          var name = attribute.name;
          var value = attribute.value;

          var names = name.split('.');

          //console.log('toObject attribute:',JSON.stringify(attribute));

          //console.log('toObject names:',JSON.stringify(names));

          var parent = theObjec;
          //console.log(' toObject parent: ', JSON.stringify(parent));
          var i = 0;
          names.forEach(function(k){
            i++;
            if(i == names.length){
              parent[k] = attribute.value;
            } else {
              /*
              parent = parent[k];
              if( typeof parent !== 'object') {
                parent = {};
              } */
              ///*
              if (!parent[k] || typeof parent[k] !== 'object'){
                parent = parent[k] = {};
              } else {
                parent = parent[k];
              }   //*/     
            }          
            //console.log(i + ' toObject theObjec: ', JSON.stringify(theObjec));
          });
          //parent = attr.value;
        });

        return theObjec;
      }
    },
    instanceMethods: {
      addChild: function (childData) {
        var treeObj = new TreeTable();
        return treeObj.addChild(this, childData);
      },
      getChildren: function (childData) {
        //console.log('getChildren:', JSON.stringify(childData));
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
