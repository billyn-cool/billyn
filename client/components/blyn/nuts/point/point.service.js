'use strict';

(function() {

	function VoucherService($resource, User, $q, Util, $http) {
		var safeCb = Util.safeCb;
		var resApp = $resource('/api/vouchers/:id/:controller', {
			id: '@_id'
		}, {
			update: {
				method: 'PUT'
			}		
		});

		var currentApp = {};

		var service = {};

		service.setCurrent = function(app) {
			return currentApp = app;
		}

		service.current = function(callback) {

			return currentApp;
		}
		
		/* first work on voucher table */

		service.find = function(voucherData) {

			if (!isNaN(nameOrId) && nameOrId > 0) {
				return resApp.get({
					id: nameOrId
				});
			}

			//otherwise find by name
			var appName = nameOrId;
			//add app config
			return $http.get('/components/blyn/core/app/config.json')
				.then(function(res) {
						var appConfig = res.data;
						console.log('appConfig', appConfig);

						if (appConfig['apps'][appName]) {

							var appData = appConfig['apps'][appName];
							appData.name = appName;

							//remove nuts element
							if (appData.nuts) {
								var nuts = appData.nuts;
								delete appData.nuts;
							}
							if (appData.cores) {
								var cores = appData.cores;
								delete appData.cores;
							}

							return resApp.findOrCreate(appData).$promise.then(function(res) {
								
								return res.data;

								//if (res.created === true && nuts.length > 0) {
								//return this.addNuts(nuts);
								//}

								//otherwise, return error
								//return $q.reject('fail to add nuts into app!');
							});
						}

						//otherwise, return error
						return $q.reject('fail to get app!');
					},
					function(err) {
						console.log(err);
					}
			);
		}
		
		service.findAll = function(voucherData){}
		
		service.create = function(voucherData){}
		
		service.update = function(voucherData){}
		
		service.delete = function(voucherData){}
		
		/* below working on voucherUser voucher */
		
		service.findVoucherUser = function(voucherUserData){}
		
		service.findAllVoucherUser = function(voucherUserData){}
		
		service.createVoucherUser = function(voucherUserData){}
		
		service.updateVoucherUser = function(voucherUserData){}
		
		service.deleteVoucherUser = function(voucherUserData){}
		
		/* below working on price table */
		
		service.findPrice = function(priceData){}
		
		service.findAllPrice = function(priceData){}
		
		service.addPrice = function(priceData){}
		
		service.deletePrice = function(priceData){}
		
		/* below working on type table */
		
		service.getType = function(typeData){}
		
		service.getTypes = function(typeData){}
		
		service.addType = function(typeData){}
		
		service.deleteType = function(typeData){}
		
		/* below working on voucher permit table */
		
		service.getPermit= function(permitData){}
		
		service.getPermits = function(permitData){}
		
		service.addPermit = function(permitData){}
		
		service.deletePermit = function(permitData){}
		
		/* below working on attribute table */
		
		service.getAttribute = function(attributeData){}
		
		service.getAttributes = function(attributeData){}
		
		service.addAttribute = function(attributeData){}
		
		service.deleteAttribute = function(attributeData){}
		
		/* below working on VoucherTimeslot table */
		
		service.getTimeslot = function(timeslotData){}
		
		service.getTimeslots = function(timeslotData){}
		
		service.addTimeslot = function(timeslotData){}
		
		service.deleteTimeslot = function(timeslotData){}
			
		return service;
	}

	angular.module('billynApp.nut')
		.factory('BVoucher', VoucherService);

})();
