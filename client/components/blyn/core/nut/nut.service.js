'use strict';

(function () {

	function NutService($resource, User, $q, Util, $http, $rootScope, BPermit, BRole) {
		var safeCb = Util.safeCb;
		var resNut = $resource('/api/nuts/:id/:controller', {
			id: '@_id'
		}, {
				update: {
					method: 'PUT'
				},
				findAllUserPermitNut: {
					method: 'GET',
					isArray: true,
					params: {
						id: 'user'
					}
				},
				findAllPermitRole: {
					method: 'GET',
					isArray: true,
					params: {
						id: 'permits',
						controller: 'roles'
					}
				}
			});

		var resNutRole = $resource('/api/nuts/roles/:id/:controller', {
			id: '@_id'
		}, {
				update: {
					method: 'PUT'
				},
				findAllNutPermitByUser: {
					method: 'GET',
					id: 'findAllNutPermitByUser'
				},
				findAllNutPermitByRole: {
					method: 'GET',
					params: {
						id: 'permits'
					}
				}
			});

		var currentNut = null;

		var service = {};

		/*
		nutData: can be object or nut Id
		if not provide Id, object will be used as where data for finding
		
		 */
		service.findNut = function (nutData) {

			if (!isNaN(nutData) && nutData > 0) {
				return resNut.get({ id: nutData }).$promise;
			}

			if (typeof nutData === 'object') {
				if (nutData.hasOwnProperty('$promise')) {
					return nutData; //means it is a nut object
				}
				if (nutData.hasOwnProperty('_id') && nutData._id > 0) {
					return $q.when(nutData); //means it is a nut object
				}
				if (nutData.hasOwnProperty('nutId') && nutData.nutId > 0) {
					return resNut.get({ id: nutData.nutId }).$promise;
				}
				//if not provide spaceId, use current space id, if want find nut not for app 				//only(for all space)
				//please specify spaceId = -1
				if (!nutData.hasOwnProperty('spaceId') || !nutData.hasOwnProperty('spaceId')) {
					nutData.spaceId = $rootScope.current.space._id;
				}
				if (!nutData.hasOwnProperty('appId') || !nutData.hasOwnProperty('appId')) {
					nutData.appId = $rootScope.current.app._id;
				}
				//find first one meet condition
				return resNut.query(nutData).$promise.then(function (nuts) {
					return $q.when(nuts[0]);
				});
			}
			if (typeof nutData === 'string') {
				var nutData = {
					name: nutData,
					spaceId: $rootScope.current.space._id,
					appId: $rootScope.current.app._id
				}

				return resNut.query(nutData).$promise.then(function (nuts) {
					return $q.when(nuts[0]);
				});				
			}
			else {
				//otherwise, return error
				return $q.reject('fail to find nut!');
			}
		}

		service.find = function (nutData) {
			return this.findNut(nutData);
		}

		/*
		for example, if want to get core nuts, please provide nutData like:
		{
		 	type: 'nut.core',
			...
		}
		if not type specify, will return all nuts
		*/
		service.findNuts = function (nutData) {

			if (typeof nutData === 'string') {
				nutData = {
					name: nutData
				};
			}

			if (typeof nutData === 'object') {
				//if not provide spaceId, use current space id, if want find nut not for app 				//only(for all space)
				//please specify spaceId = -1
				if (!nutData.hasOwnProperty('spaceId') || !nutData.hasOwnProperty('spaceId')) {
					nutData.spaceId = $rootScope.current.space.id;
				}
				if (!nutData.hasOwnProperty('appId') || !nutData.hasOwnProperty('appId')) {
					nutData.appId = $rootScope.current.app.id;
				}

				//find all nuts meet condition
				return resNut.query(nutData).$promise;
			}

			//otherwise, return error
			return $q.reject('fail to find nut!');
		}

		service.findAll = function (nutData) {
			return this.findNuts;
		}

		//must provide appId and spaceId
		service.addNut = function (nutName, appId, spaceId, isCore) {
			var configPath;
			//first get nutData from config file
			if (typeof nutName === 'string') {
				configPath = '/components/blyn/nuts/' + nutName + '/config.json';
			}
			if (isCore === true) {
				configPath = '/components/blyn/core/' + nutName + '/config.json';
			}

			return $http.get(configPath).then(function (res) {
				var nutData = res.data;
				var whereData = {};
				var defaultData = {};
				if (typeof nutData === 'object') {
					if (spaceId && spaceId != null) {
						whereData.spaceId = spaceId;
					}
					if (appId && appId != null) {
						whereData.appId = appId;
					}

					whereData.name = nutName;
					if (nutData.hasOwnProperty('type')) {
						whereData.type = nutData.type;
						// console.log('whereData:',whereData);

					}
					return resNut.save(whereData).$promise;
				}
			});


			//otherwise, return error
			//return $q.reject('fail to add nut into app!');
		}

		service.getNutConfig = function (nutName, isCore) {
			var configPath;
			//first get nutData from config file
			if (typeof nutName === 'string') {
				configPath = '/components/blyn/nuts/' + nutName + '/config.json';
			}
			if (isCore === true) {
				configPath = '/components/blyn/core/' + nutName + '/config.json';
			}

			return $http.get(configPath);
		}

		service.addCore = function (nutData, appId, spaceId) {
			return this.addNut(nutData, appId, spaceId, true);
		}

		service.getNutPermit = function (nutData, permitName) {
			return this.getNutPermits(nutData).then(function (permits) {
				return permits[permitName];
			}).$promise;
		}

		//get all permits available nutData, this use for 
		//show a permit list to apply by role
		service.getNutPermits = function (nutData) {

			var nutName;
			/*
			if(angular.isString(nutData) && !angular.isNumber(nutData)){
				nutName = nutData;
				return $http.get('../../nuts/' + nutName + '.json').then(function(config){
					return config.permits;
				}).$promise;
			} else {*/
			return this.findNut(nutData).then(function (nut) {
				var nutName = nut.name;
				var path = '/components/blyn/nuts/' + nutName + '/config.json';
				if (nut.type.name === 'nut.core') {
					path = '/components/blyn/core/' + nutName + '/config.json';
				}
				return $http.get(path).then(function (config) {
					return config.data.permits;
				});
			});
			//}

			//otherwise return error
			//$q.reject('fail to get nut permits');			
		}

		//this function add row into PermitRole table
		service.addNutPermitRole = function (nutData, permitData, roleData) {

			var model = this;

			var permitId, nutId, roleId;
			if (angular.isString(permitData)) {
				permitData = {
					name: permitData
				}
			}
			if (!permitData.spaceId && nutData.spaceId) {
				permitData.spaceId = nutData.spaceId;
			}
			if (angular.isString(roleData)) {
				roleData = {
					name: roleData
				}
			}
			if (!roleData.spaceId && nutData.spaceId) {
				roleData.spaceId = nutData.spaceId;
			}
			return BPermit.findOrCreate(permitData).$promise.then(function (permit) {
				permitId = permit._id;
				return model.findNut(nutData);
			}).then(function (nut) {
				nutId = nut._id;
				return BRole.find(roleData).$promise;
			}).then(function (role) {
				return BPermit.addPermitRole({
					owner: 'nut',
					ownerId: nutId,
					permitId: permitId,
					roleId: role._id,
					spaceId: role.spaceId
				});
			});
		}

		service.deleteNutPermitRole = function (permitRoleId) {
			return BPermit.deletePermitRole(permitRoleId);
		}

		//find all permit role for nut, usually can find all for app or space
		service.findAllPermitRole = function (findData) {
			//findData.owner = 'nut';
			return resNut.findAllPermitRole(
				findData
			).$promise.then(function (results) {
				return $q.when(results);
			});
		}

		//result: [{roleId, permitId, nutId, role, permit}]
		/*
		service.findAllUserNutPermit = function(spaceId, appId, userId){
			
			if(!userId || userId === undefined){
				userId = $rootScope.current.user._id;
			}
			if(!appId || appId === undefined){
				appId = $rootScope.current.app._id;
			}
			if(!spaceId || spaceId === undefined){
				spaceId = $rootScope.current.space._id;
			}
			return BPermit.findAllUserPermitRole({
				userId: userId,
				owner: 'nut',
				spaceId: spaceId
			}).$promise.then(function(res){
				return res.map(function(r){
					return r.nutId = r.ownerId;
				})
			}).$promise;
		}*/

		/*
		return permit + nut list, like [{permit, nut, role}]
		*/
		service.findAllUserPermitNut = function (appId, spaceId, userId) {

			var findData = {};

			if (spaceId == undefined) {
				spaceId = $rootScope.current.space._id;
			}
			if (userId == undefined) {
				userId = $rootScope.current.user._id;
			}
			findData.userId = userId;
			findData.spaceId = spaceId;
			if (angular.isNumber(appId) && appId > 0) {
				findData.appId = appId;
			}
			return resNut.findAllUserPermitNut(findData).$promise.then(function (permitNuts) {

				return permitNuts;

				/*
				var retNuts = {};
				
				permitNuts.forEach(function(pr){
					retNuts[pr.nut._id]=pr;
				})
				var list = [];
				for(var key in retNuts){
					list.push(retNuts[key]);
				}*/

				/*
				var retPermitNuts = [];

				if(angular.isNumber(appId) && appId >0)
				{
					permitNuts.forEach(function(o,index){
						if(o.nut.app._id !== appId){
							delete permitNuts[index];
							//retPermitNuts.push(o);
						}
					});

				} */
				//return retPermitNuts;
				//return list;
			});
		}

		service.findUserNuts = function (appId, spaceId, userId) {

			return this.findAllUserPermitNut(appId, spaceId, userId).then(function (permitNuts) {
				var nuts = {};
				angular.forEach(permitNuts, function (o) {
					var permit = o.permit;
					var nut = nuts[o.nut.name] ? nuts[o.nut.name] : o.nut;
					if (!nut.permits) {
						nut.permits = {};
					}
					nut.permits[permit.name] = permit;
					nuts[nut.name] = nut;
				});
				return $q.when(nuts);
			});
		}

		service.findUserNutPermits = function (nutData) {

			var that = this;

			return this.findNut(nutData).then(function (nut) {
				var theNut = nut;
				return that.findUserNuts(nut.appId, nut.spaceId).then(function (userNuts) {
					var retList = [];
					angular.forEach(userNuts, function (o) {
						if (o._id === theNut._id) {
							retList = o.permits;
						}
					})
					return $q.when(retList);
				});
			})
		}

		service.userHasPermit = function (nutData, permitData) {
			return this.findUserNutPermits(nutData).then(function (permits) {
				var ret = false;
				if (angular.isString(permitData)) {					
					angular.forEach(permits, function (permit) {
						if (permit.name === permitData) {
							ret = true;
						}
					})
				}

				if (angular.isObject(permitData)) {
					var permitId = permitData._id || permitData.id || permitData.permitId || undefined;
					if (permitId) {						
						angular.forEach(permits, function (permit) {
							if (permit._id === permit.id) {
								ret = true;
							}
						})
					}
				}
				//return ret;
				return $q.when(ret);

				//otherwise return false
				//return $q.when(false);
			}, function (error) {
				return $q.when(false);//by default, return false
			})
		}

		//this function use to find nut permit by role
		service.findAllNutPermitByRole = function (roleId) {
			return this.findAllPermitRole({ roleId: roleId });
		}

		return service;
	}

	angular.module('billynApp.core')
		.factory('BNut', NutService);

})();
