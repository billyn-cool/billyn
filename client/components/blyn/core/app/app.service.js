'use strict';

(function () {

	function AppService($resource, User, $q, Util, $http, $rootScope, BNut, BPermit) {
		var safeCb = Util.safeCb;
		var resApp = $resource('/api/apps/:id/:controller', {
			id: '@_id'
		}, {
				bulkCreate: {
					method: 'POST',
					isArray: true,
					params: {
						id: 'bulk'
					}
				},
				joinSpace: {
					method: 'POST',
					params: {
						id: 'joinSpace'
					}
				},
				addType: {
					method: 'POST',
					params: {
						controller: 'addType'
					}
				},
				findOrCreate: {
					method: 'POST'
					//method: 'POST',
					//isArray: true
				}
			});

		var currentApp = {};

		var service = {};

		service.create = function (spaceId, appName) {

			return $http.get('/components/blyn/core/app/config.json').then(function (res) {
				var appConfig = res.data;

				var appData = appConfig['apps'][appName];
				appData.name = appName;
				appData.spaceId = spaceId;
				return resApp.save(appData)
					.$promise.then(function (app) {
						return $q.when(app);
					});
			});
		}

		service.bulkCreate = function (appDataCollection, spaceId) {
			return resApp.bulkCreate({
				appDataCollection: appDataCollection,
				spaceId: spaceId
			}).$promise;
		}

		service.setCurrent = function (app) {
			return currentApp = app;
		}

		service.current = function (callback) {

			return currentApp;

			if (arguments.length === 0) {
				return currentApp;
			}

			var value = (currentApp.hasOwnProperty('$promise')) ?
				currentApp.$promise : currentApp;

			return $q.when(value)
				.then(app => {
					safeCb(callback)(app);
					return app;
				}, () => {
					safeCb(callback)({});
					return {};
				});

		}

		service.find = function (nameOrId, spaceId) {

			if (!spaceId) {
				spaceId = $rootScope.current.space._id;
			}

			if (!isNaN(nameOrId) && nameOrId > 0) {
				var findData = {};
				findData.id = nameOrId;
				/*
				if(spaceId && spaceId >0){
					findData.spaceId = spaceId;
				}*/
				return resApp.get(findData);
			}

			//otherwise find by name
			if (angular.isString(nameOrId)) {

				var appName = nameOrId;

				return resApp.query({
					name: appName,
					spaceId: spaceId
				}).$promise.then(function (rows) {

					if (rows.length > 0) {
						return $q.when(rows[0]);
					} else {
						return this.create(spaceId, appName);
					}
				})

				/*

				if(spaceId != undefined && spaceId > 0){
					return resApp.get({
						name: appName,
						spaceId: spaceId
					}).$promise.then(function(app){
						return resApp.get({
							id: app._id,
							spaceId: spaceId
						});
					}).$promise;
				} */
				//add app config
				/*
				return $http.get('/components/blyn/core/app/config.json')
				.then(function(res) {
					var appConfig = res.data;
						//console.log('appConfig', appConfig);

					if (appConfig['apps'][appName]) {

						var appData = appConfig['apps'][appName];
						appData.name = appName;
						appData.spaceId = spaceId;

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
				});*/
			}
		}

		//api: api/apps/space?spaceId=xx
		service.findAppsInSpace = function (spaceId, findData) {

			if (typeof findData !== 'object') {
				findData = {};
			}

			findData.spaceId = spaceId;

			if (spaceId === undefined) {
				findData.spaceId = $rootScope.current.space._id;
			}

			findData.id = 'space';

			return resApp.query(findData).$promise.then(function (apps) {
				var oApps = {};
				apps.map(function (res) {
					var key = res.name;
					var o = {};
					o[key] = res;
					oApps = Object.assign(oApps, o);
				});
				return oApps;
			});
		}

		service.findAppsInStore = function (findData) {

			var theService = service;

			return $http.get('components/blyn/core/app/config.json').then(function (res) {
				var apps = res.data.apps;
				var theApps = Object.assign({}, apps);

				return theService.findAppsInSpace($rootScope.current.space._id)
					.then(function (spaceApps) {

						var keys = Object.keys(spaceApps);

						for (var key in apps) {
							if (keys.indexOf(key) !== -1) {
								delete theApps[key];
							}
						}

						return $q.when(theApps);
					});
			});
		}

		/* this function return app list for user, each app in list is ensure contain permit nuts
		return format: 
		{ 	'appEngine': {..., nuts: {id1: nutObject1, id2: nutObject2}},
			'weMember': {..., nuts: {id1: nutObject1, ...}}
		}
		*/
		service.findAppsByUser = function (spaceId, userId) {

			var apps = {};

			return BNut.findAllUserPermitNut(null, spaceId, userId).then(function (permitNuts) {

				permitNuts.forEach(function (o) {

					var nut = o.nut;
					var permit = o.permit;
					var appName = o.nut.app.name;
					var app = apps[appName] ? apps[appName] : o.nut.app;

					if (!o.permits) {
						o.permits = {};
					}

					o.permits[permit.name] = permit.name;

					if (!app['permitNuts']) {
						app['permitNuts'] = {};
					}

					app.permitNuts[nut.name] = o;

					apps[appName] = app;

				});

				return apps;

			});
		}

		service.joinSpace = function (spaceId, appNameOrId) {

			var appId;
			var model = this;
			return this.find(appNameOrId).then(function (app) {
				if (app._id) {
					appId = app._id;
				}
				if (app.id) {
					appId = app.id;
				}
				return resApp.joinSpace({
					spaceId: spaceId,
					appId: appId
				}).$promise.then(function (res) {
					return model.addAppNuts(appId, spaceId);
				});
			});
		}

		service.addAppNuts = function (appId, spaceId) {
			var model = this;

			this.find(appId).$promise.then(function (app) {
				//console.log('findAppidShow:',app);
				return $http.get('/components/blyn/core/app/config.json').then(function (res) {
					var appConfig = res.data;
					//console.log('appConfig:',appConfig);
					var nutsData;
					if (appConfig['apps'][app.name]['cores']) {
						nutsData = appConfig['apps'][app.name]['cores'];
						var tempType = appConfig['apps'][app.name]['type'];
						angular.forEach(nutsData, function (nutDate, key) {
							nutDate.type = tempType;
						});
					}
					if (appConfig['apps'][app.name]['nuts']) {
						nutsData = appConfig['apps'][app.name]['nuts'];
						var tempType = appConfig['apps'][app.name]['type'];
						angular.forEach(nutsData, function (nutDate, key) {
							nutDate.type = tempType;
						});
					}

					var proms = [];

					//add promise functions into array
					var chain = $q.when();
					angular.forEach(nutsData, function (nutData, key) {
						nutData.name = key;
						var nutName = nutData.name;
						var nutType = nutData.type;

						var isCore = null;
						if (nutType === 'app.core') {
							isCore = true;
						}
						chain = chain.when(model.addAppNut(nutName, appId, spaceId, isCore));
						//proms.push(model.addAppNut(nutName, appId, spaceId, isCore));
					});
					return chain;
					/*
					return $q.all(proms).then(function () {
						return true;
					});*/
				});
			});
		}

		service.addAppNut = function (nutName, appId, spaceId, isCore) {

			var nuts = [];
			var model = this;
			model.getAppConfig(appId).then(function (appConfig) {

				var nuts = {};

				if (appConfig['cores']) {
					nuts = appConfig['cores'];
				}

				if (appConfig['nuts']) {
					nuts = Object.assign(nuts, appConfig['nuts']);
				}
				return nuts;
			}).then(function (nuts) {

				return BNut.addNut(nutName, appId, spaceId, isCore).then(function (nut) {

					var isCore = false;
					if (nut.type.name === 'nut.core') {
						isCore = true;
					}

					return BNut.getNutConfig(nut.name, isCore).then(function (nutConfig) {
						var grants = nuts[nutName]['grants'];

						//return BRole.addGrants(grants,{owner: 'nut',ownerId: nut._id, spaceId: nut.spaceId});

						///*
						var proms = [];
						var bulkData = [];

						//add role to nut permit according to config in app/config.json
						for (var key in grants) {
							var permitName = grants[key];
							var permitList = permitName.split(",");

							permitList.forEach(function (permit) {
								var roleName = key;

								permit = nutConfig[permit] ? nutConfig[permit] : permit;

								var prData = {};
								prData.role = key;
								prData.permit = permit;
								prData.spaceId = nut.spaceId;
								prData.owner = 'nut';
								prData.ownerId = nut._id;
								bulkData.push(prData);
							})

							//proms.push(BNut.addNutPermitRole(nut, permitName, roleName));//CoreServices
						}

						return BPermit.addBulkPermitRole(bulkData);
					});
					//*/

					//return $q.all(proms);
				});
			});
		}

		service.getAppConfig = function (appData) {
			var model = this;
			return model.find(appData).$promise.then(function (app) {
				return $http.get('/components/blyn/core/app/config.json').then(function (res) {
					var appConfig = res.data;

					return $q.when(appConfig['apps'][app.name]);
				});
			});
		}
		
		service.getConfig = function(){
			return $http.get('/components/blyn/core/app/config.json').then(function (res) {
					var appConfig = res.data;

					return $q.when(appConfig);
				});
		}

		return service;
	}

	angular.module('billynApp.core')
		.factory('BApp', AppService);

})();
