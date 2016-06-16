'use strict';

import sqldb from '../../sqldb';
import _ from 'lodash';
var Promise = require('bluebird');

export default function(sequelize, DataTypes) {
  return sequelize.define('Timeslot', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING
    },
    spaceId: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
	owner: {
		type: DataTypes.STRING
	},
	ownerId: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
	alias: DataTypes.STRING,
	description: DataTypes.STRING,
	startTime: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
	endTime: {
		type: DataTypes.INTEGER,
		defaultValue: -1
	},
    active: DataTypes.BOOLEAN
  },{
	  classMethods: {

	  	addTimeslots: function(timeslotListData, ownerData){

	  		//console.log('addTimeslots timeslotListData:', JSON.stringify(timeslotListData));

	  		var count = 0;
	  		var flist = [];
	  		var that = this;

	  		for(var key in timeslotListData){
	  			//console.log('addTimeslots timeslotListData[key]:', JSON.stringify(timeslotListData[key]));
	  			var timeslotData = Object.assign({},timeslotListData[key]);
	  			//console.log('addTimeslots timeslotData:', JSON.stringify(timeslotData));
	  			timeslotData.name = key;
	  			//console.log('addTimeslots timeslotData:', JSON.stringify(timeslotData));
	  			flist.push(timeslotData);
	  		}

	  		//console.log('addTimeslots flist:', JSON.stringify(flist));

	  		return Promise.each(flist, function(timeslotData){
	  			//console.log('addTimeslots timeslotData:', JSON.stringify(timeslotData));
	  			return that.addTimeslot(timeslotData, ownerData);
	  		}).then(function(){
	  			return Promise.resolve(count);
	  		});
	  	},

	  	addTimeslot: function(timeslotData, ownerData){

	  		//console.log('addTimeslot timeslotData:', JSON.stringify(timeslotData));

	  		var timeslots = this.populateTimeslots(timeslotData,ownerData);

	  		timeslots.forEach(function(timeslot){
				timeslot.name = timeslotData.name;
	  			timeslot.spaceId = ownerData.spaceId;
	  			timeslot.owner = ownerData.owner;
	  			timeslot.ownerId = ownerData.ownerId;
	  		});
			var list = [];
			var that = this;
			var i=0;
			//console.log('addTimeslot timeslots:', JSON.stringify(timeslots));
			return Promise.each(timeslots,function(ts){
				//console.log('timeslot ts:'+ i++,JSON.stringify(ts));
				return that.findOrCreate({
					where: {
						name: ts.name,
						owner: ts.owner,
						ownerId: ts.ownerId
					},
					defaults:ts
				}).spread(function(timeslot,created){
					//console.log('timeslot created:',created);
					list.push(timeslot);
				});
			}).then(function(){
				return Promise.resolve(list);
			})
			  
			//console.log('2 addTimeslot timeslots:', JSON.stringify(timeslots));

	  		//return this.bulkCreate(timeslots);
	  	},

	  	dateAdd: function(date, interval, units) {
			//console.log("interval:unit***",interval+":"+units);
			var ret = new Date(date); //don't change original date
			//console.log('1 ret:',ret);
			switch (interval.toLowerCase()) {
				case 'year':
					ret.setFullYear(ret.getFullYear() + units);
					break;
				case 'quarter':
					ret.setMonth(ret.getMonth() + 3 * units);
					break;
				case 'month':
					ret.setMonth(ret.getMonth() + units);
					break;
				case 'week':
					ret.setDate(ret.getDate() + 7 * units);
					break;
				case 'day':
					ret.setDate(ret.getDate() + units);
					break;
				case 'hour':
					ret.setTime(ret.getTime() + units * 3600000);
					break;
				case 'minute':
					ret.setTime(ret.getTime() + units * 60000);
					break;
				case 'second':
					ret.setTime(ret.getTime() + units * 1000);
					break;
				default:
					ret = undefined;
					break;
			}
			//console.log('2 ret:',ret);
			return ret;
		},

		populateTimeslots: function(timeslotConfig,context) {

			//console.log('populateTimeslots timeslotConfig:', JSON.stringify(timeslotConfig));
	
			/**
			   	* timeslotConfig format: 
			   	{
					startTime: DateTime
					endTime: DateTime
					startTime.offset.value: 100 or +100 or -100
					endTime.offset.unit: second, minute, hour, day, week, month, quarter, year
					repeat.value: integer
					repeat.timeUnit: second, minute, hour, day, week, month, quarter, year
					repeat.startTime: DateTime
					repeat.endTime: DateTime
					repeat.interval: number,
					timeSplit: integer
					
				}
			   	* return: array of timeslot
			   	*/

			var timeslots = [];

			if (typeof timeslotConfig === 'object') {
				//console.log('xxx');
				var ts = {};
				var startTime;
				var endTime;
				startTime = Date.now();
				endTime = Date.now();
				
				if (timeslotConfig.startTime && !isNaN(timeslotConfig.startTime)) {
					startTime = timeslotConfig.startTime;
				}
				if (context && context.startTime && !isNaN(context.startTime)) {
					startTime = context.startTime;
				}
				if (timeslotConfig.endTime && !isNaN(timeslotConfig.endTime)) {
					endTime = timeslotConfig.endTime;
				}
				if (context && context.endTime && !isNaN(context.endTime)) {
					endTime = context.endTime;
				}

				var timeUint = 'day';
				if (timeslotConfig.timeUnit) {
					timeUnit = timeslotConfig.timeUnit;
				}
				
				//console.log("1 startTime:endTime:",startTime + ":" + endTime);
				
				if(timeslotConfig['startTime.offset.value'] && timeslotConfig['startTime.offset.unit']){
					//console.log('yyy dataAdd:', this.dateAdd);
					startTime = this.dateAdd(startTime, timeslotConfig["startTime.offset.unit"], timeslotConfig["startTime.offset.value"]).getTime();
				}
				if(timeslotConfig['endTime.offset.value'] && timeslotConfig['endTime.offset.unit']){
					//console.log('zzz');
					endTime = this.dateAdd(endTime, timeslotConfig["endTime.offset.unit"], timeslotConfig["endTime.offset.value"]).getTime();
				}
				
				//console.log("2 startTime:endTime:",startTime + ":" + endTime);
				
				/*
				if(timeslotConfig.hasOwnProperty('startTime') && typeof timeslotConfig.startTime === 'object'){
					console.log(1);
					if(timeslotConfig.startTime.offset && typeof timeslotConfig.startTime.offset === 'object'){
						console.log(2);
						if (timeslotConfig.startTime.offset.value && timeslotConfig.startTime.offset.timeUnit) {
							console.log(3);
							startTime = dateAdd(startTime, timeslotConfig.startTime.offset.timeUnit, timeslotConfig.startTime.offset.value);
						}
					}
				}*/
				/*
				if(timeslotConfig.endTime && typeof timeslotConfig.endTime === 'object'){
					//console.log(1);
					if(timeslotConfig.endTime.offset && typeof timeslotConfig.endTime.offset === 'object'){
						//console.log(2);
						if (timeslotConfig.endTime.offset.value && timeslotConfig.endTime.offset.timeUnit) {
							//console.log(3);
							endTime = this.dateAdd(endTime, timeslotConfig.endTime.offset.timeUnit, timeslotConfig.endTime.offset.value);
						}
					}
				}
				*/
				
				//console.log("2 startTime",startTime);
				//console.log("2 endTime",endTime);

				if (timeslotConfig.timeSplit) {
					var split = timeslotConfig.timeSplit;
					var splitInterval = (endTime - startTime) / split;
					var i = 0;
					while (i++ < split) {
						ts = {};
						ts.name = timeslotConfig.name + '_'+i || "ts_"+startTime+"_"+i;
						ts.startTime = startTime + i * splitInterval;
						ts.endTime = endTime + i * splitInterval
						timeslots.push(ts);
					}
					return timeslots;
				}

				//add first timeslot
				var ts = {
					name: timeslotConfig.name || 'ts_'+startTime,
					startTime: startTime,
					endTime: endTime
				};
				
				timeslots.push(ts);

				if (timeslotConfig.repeat && timeslotConfig.repeat.timeUnit) {
					var repeatTimeUnit = timeslotConfig.repeat.timeUnit;
					repeatInterval = 1;
					if (timeslotConfig.repeat.interval) {
						repeatInterval = timeslotConfig.repeat.interval;
					}
					
					//by default, max repeat is 10000
					var repeat = 10000;
					if (timeslotConfig.repeat.value) {
						repeat = timeslotConfig.repeat.value;
					}

					var i = 1;
					repeatStartTime = startTime;
					repeatEndTime = dateAdd(endTime, repeatTimeUnit, repeat);
					if (timeslotConfig.repeat.startTime) {
						repeatStartTime = timeslotConfig.repeat.startTime;
					}
					if (timeslotConfig.repeat.endTime) {
						repeatEndTime = timeslotConfig.repeat.endTime;
					}

					while (i++ <= repeat) {
						var ts = {};
						ts.name = timeslotConfig.name + "_"+i||"ts_"+startTime+"_"+i;
						ts.startTime = dateAdd(startTime, repeatTimeUnit, repeatInterval);
						ts.endTime = dateAdd(endTime, repeatTimeUnit, repeateInterval);
						if (ts.startTime > repeatStartTime && ts.endTime <= repeatEndTime) {
							timeslots.push(ts);
						}
						if (ts.endTime > repeatEndTime) {
							break;
						}
					}
				}
				
				return timeslots;
			}
		}
	  },
	}
  );
}


