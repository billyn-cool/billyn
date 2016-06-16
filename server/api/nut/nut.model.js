'use strict';

import sqldb from '../../sqldb';
import _ from 'lodash';
var Promise = require('bluebird');

export default function(sequelize, DataTypes) {
  return sequelize.define('Nut', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING
    },
	appId: DataTypes.INTEGER,
	spaceId: DataTypes.INTEGER,
	alias: DataTypes.STRING,
    description: DataTypes.STRING,
	typeId: DataTypes.INTEGER,
    active: DataTypes.BOOLEAN
  },{
	  classMethods: {
		  addType: function(typeData){
			  return this.getType(typeData,true);
		  },
		  getType: function(typeData,autoCreated){
			  //console.log('in app Category:', Category);
			  //console.log('in app User:', User);
			  //console.log('in app sqldb:', sqldb);
			  var Category = sqldb.Category;
			  //var Category = sqldb.Category;
			  //console.log('in app Category:', Category);
			  if(typeof typeData === 'string' && isNaN(typeData)){
				  var typeName = typeData;
				  
				  typeData = {};
				  
				  typeData.name = typeName;
				  
				  //console.log('in space getType');
				  //console.log('in space Category:', Category);
				  //console.log('space getType typeData:', JSON.stringfy(typeData));
			  }
			  
			  if(typeof typeData === 'object' && !_.isEmpty(typeData)){
				typeData.owner = 'nut';
				var tyName = typeData.name;
			    if(tyName.substr(0,4).toLowerCase() !== 'nut.'){
				   tyName = 'nut.' + tyName;
			    }
				typeData.name = tyName;
				//console.log('app model typeData:', JSON.stringify(typeData));
			  	return Category.getType(typeData, true);
			  }
			  
			  //otherwise return promise reject
			  sequelize.Promise.reject(new Error('fail to add type for nut!'));
		  },
		  addBulkNut: function(bulkNutData){

		  	var that = this;
		  	
		  	return Promise.each(bulkNutData, function(nutData){
		  		if(nutData.type && !nutData.typeId){
		  			var typeData = {
		  				name: nutData.type,
		  				spaceId: nutData.spaceId
		  			};

		  			return that.getType(typeData, true).then(function(type){
		  				nutData.typeId = type._id;
		  				//console.log('nutData:', nutData);
		  				return Promise.resolve(null);
		  			});
		  		} else {
		  			return Promise.resolve(null);
		  		}
		  	}).then(function(){
		  		//console.log('2 bulkNutData:', JSON.stringify(bulkNutData));
		  		return that.bulkCreate(bulkNutData);
		  	});

		  }
	  },
  });
}
