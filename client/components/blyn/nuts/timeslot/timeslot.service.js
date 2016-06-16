'use strict';

(function() {

	/**
	 * The Util service is for thin, globally reusable, utility functions
	 */

	function TimeslotService($window) {
		var  Service = {
			/**
			 * Return a callback or noop function
			 *
			 * @param  {Function|*} cb - a 'potential' function
			 * @return {Function}
			 */
			safeCb(cb) {
				return (angular.isFunction(cb)) ? cb : angular.noop;
			},

			/**
	 	   	* timeslotConfig format: 
	 	   	{
				startTime: DateTime
				endTime: DateTime
				startTimeOffset: 100 or +100 or -100
				endTimeOffset: 
				timeUnit: second, minute, hour, day, week, month, quarter, year
				repeatInterval: integer
				repeat: integer
				repeatTimeUnit: second, minute, hour, day, week, month, quarter, year
				timeSplit: integer
				repeatStartTime: integer
				repeatEndTime: integer
				}
	 	   	* return: array of timeslot
	 	   	*/
			populateTimeslots(timeslotConfig) {

				var timeslots = [];

				if (angular.isObject(timeslotConfig)) {
					var ts = {};
					var startTime;
					var endTime;
					if (timeslotConfig.startTime && angular.isNumber(startTime)) {
						startTime = timeslotConfig.startTime;
					}
					if (timeslotConfig.endTime && angular.isNumber(endTime)) {
						endTime = timeslotConfig.endTime;
					}

					var timeUint = 'day';
					if (timeslotConfig.timeUnit) {
						timeUnit = timeslotConfig.timeUnit;
					}

					if (timeslotConfig.startTimeOffset) {
						startTime = dateAdd(ts.startTime, timeUnit, timeslotConfig.startTimeOffset);
					}

					if (timeslotConfig.endTimeOffset) {
						startTime = dateAdd(ts.endTime, timeUnit, timeslotConfig.endTimeOffset);
					}

					if (timeslotConfig.timeSplit) {
						var split = timeslotConfig.timeSplit;
						var splitInterval = (endTime - startTime) / split;
						var i = 0;
						while (i++ < split) {
							ts = {};
							ts.startTime = startTime + i * splitInterval;
							ts.endTime = endTime + i * splitInterval
							timeslots.push(ts);
						}
						return timeslots;
					}

					//add first timeslot
					var ts = {
						startTime: startTime,
						endTime: endTime
					};
					
					timeslots.push(ts);

					if (timeslotConfig.repeatTimeUnit) {
						var repeatTimeUnit = timeslotConfig.repeatTimeUnit;
						repeatInterval = 1;
						if (timeslotConfig.repeatInterval) {
							repeatInterval = timeslotConfig.repeatInterval;
						}
						
						//by default, max repeat is 10000
						var repeat = 10000;
						if (timeslotConfig.repeat) {
							varrepeat = timeslotConfig.repeat;
						}

						var i = 1;
						repeatStartTime = startTime;
						repeatEndTime = dateAdd(endTime, repeatTimeUnit, repeat);
						if (timeslotConfig.repeatStartTime) {
							repeatStartTime = timeslotConfig.repeatStartTime;
						}
						if (timeslotConfig.repeatEndTime) {
							repeatEndTime = timeslotConfig.repeatEndTime;
						}

						while (i++ <= repeat) {
							var ts = {};
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

		};

		return Service;
	}

	function dateAdd(date, interval, units) {
		var ret = new Date(date); //don't change original date
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
		return ret;
	}

	angular.module('billynApp.nut')
		.factory('Timeslot', TimeslotService);

})();
