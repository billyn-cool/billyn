'use strict';

(function () {

	function SpaceService($resource, User, $q, Util, BApp, $rootScope, BRole, BCircle, $http) {
		var safeCb = Util.safeCb;
		var resSpace = $resource('/api/spaces/:id/:controller', {
			id: '@_id'
		}, {
				update: {
					method: 'PUT'
				},
				userJoin: {
					method: 'GET',
					params: {
						controller: 'userJoin'
					}
				},
				addType: {
					method: 'POST',
					params: {
						controller: 'addType'
					}
				},
				findUserSpaces: {
					method: 'GET',
					params: {
						id: 'user',
					},
					isArray: true
				}
			});

		var currentSpace = {};

		var service = {};

		service.getAllSpaces = function () {
			return $resource('/api/spaces/').query().$promise;
		}
		service.getUserSpaces = function (findData, callback) {
			//get: /api/spaces/user
			//return spaces
			return $q(function (resolve, reject) {
				var model = this;
				var spaces = [];
				if (findData == undefined) {
					findData = {
						userId: $rootScope.current.user._id
					}
				}
				if (angular.isNumber(findData)) {
					var userId = findData;
					findData = {
						userId: userId
					};
				}
				if (angular.isObject(findData)) {
					var typeName
					for (var key in findData) {
						if (key === 'type' || key.toLowerCase() === 'typename') {
							typeName = findData[key];
							delete findData[key];
						}
					}
					return resSpace.findUserSpaces(findData).$promise.then(function (resources) {
						var spaces = [];
						resources.forEach(function (res) {
							//be default, only return none-person spaces
							if (typeName === undefined && res.type.name !== 'space.person.normal') {
								spaces.push(res);
							} else {
								if (typeName === res.type.name) {
									spaces.push(res);
								}
							}
						});
						return resolve(spaces);
						/*
						return $q(function(resolve, reject) {
							var spaces = [];
							angular.forEach(resources, function(resource) {
								model.getSpace(resource.spaceId).then(function(space) {
									spaces.push(space);
									spaces.length == resources.length && resolve(spaces);
								}, function(err) {
									reject(err);
								});
							});
						});
						*/
					}, function (err) {
						return $q.reject(err);
					});
				}
			});

			//otherwise, return []
			//return $q.reject('fail to get user spaces!');

		};

		service.getTypeSpaces = function (typeData, callback) {
			//get: /api/spaces/type
			//return spaces
			var queryData = {};
			queryData.id = 'type';
			if (isNaN(typeData) && typeData > 0) {
				queryData.typeId = typeData;
			}
			if (typeof typeData === 'object') {
				queryData = Object.assign(queryData, typeData);
			}
			return resSpace.query(queryData,
				function (data) {
					return safeCb(callback)(null, data);
				},
				function (err) {
					return safeCb(callback)(err);
				}).$promise;
		};

		service.getSpace = function (spaceId, callback) {
			//get: /api/spaces/:id
			//return spaces
			return resSpace.get({
				id: spaceId
			},
				function (data) {
					return safeCb(callback)(null, data);
				},
				function (err) {
					return safeCb(callback)(err);
				}).$promise;
		};

		/*
		service.create = function (spaceData, callback) {
			//post: /api/spaces/
			//return new space
			//console.log('space create spaceData:',JSON.stringify(spaceData));
			var model = this;
			var newSpace;
			return resSpace.save(spaceData,
				function (res) {
					safeCb(callback)(null, res);
					return res;
				},
				function (err) {
					return safeCb(callback)(err);
				})
				.$promise.then(function (res) {//add roles
					newSpace = res;
					return model.addRole({
						name: 'admin',
						spaceId: newSpace._id
					}).$promise.then(function (adminRole) {
						return model.addRole({
							name: 'member',
							spaceId: newSpace._id
						}).$promise;
					}).then(function (memberRole) {
						return model.addRole({
							name: 'customer',
							spaceId: newSpace._id
						}).$promise;
					});
				}).then(function (res) {//add app
					return model.addApp(newSpace._id, 'appEngine').then(function () {
						//console.log('newSpace:', newSpace);
						if (newSpace.type.name === 'space.person.normal') {
							return model.addApp(newSpace._id, 'userApp');
						} else {
							return model.addApp(newSpace._id, 'weMember');
						}
					});
				}).then(function (res) {//add user as admin
					return model.getRole({
						name: 'admin',
						spaceId: newSpace._id
					})
						.then(function (adminRole) {
							return BRole.addUserRole({
								userId: $rootScope.current.user._id,
								roleId: adminRole._id,
								spaceId: newSpace._id
							});
						})
						.then(function () {
							return newSpace;
						});
				});
		}*/

		service.create = function (spaceData) {
			var config, newSpace, theType;
			var that = this;
			return this.getConfig().then(function (conf) {
				config = conf;
				var types = config.types;
				theType = types[spaceData.type];
				if (theType) {
					spaceData.type = theType;
				}
				return resSpace.save(spaceData).$promise;
			}).then(function (space) {

				//add apps for space

				newSpace = space;
				var apps = ['appEngine'];

				if (newSpace.type.name === 'space.person.normal') {
					apps.push('userApp');
				} else {
					if (theType.apps) {
						theType.apps.forEach(function (appName) {
							if (appName.toLowerCase() != 'appengine') {
								apps.push(appName);
							}
						})
					}
				}

				return BApp.getConfig().then(function (appConfig) {
					var appDataCollection = [];
					apps.forEach(function (appName) {
						var appData = appConfig.apps[appName];
						appData.name = appName;
						appDataCollection.push(appData);
					})

					return BApp.bulkCreate(appDataCollection, newSpace._id);
				})

				/*

				var chain = $q.when();
				apps.forEach(function (appName) {
					chain = chain.then(that.addApp(newSpace._id, appName));
				})*/

				//return chain;

			}).then(function () {
				return that.getRole({
					name: 'admin',
					spaceId: newSpace._id
				})
					.then(function (adminRole) {
						return BRole.addUserRole({
							userId: $rootScope.current.user._id,
							roleId: adminRole._id,
							spaceId: newSpace._id
						});
					});
			}).then(function () {
				//add default circle
				if (newSpace.type.name.toLowerCase() !== 'space.person.normal') {
					return BCircle.create({
						spaceId: newSpace._id,
						name: newSpace.name + "_" + "circle",
						type: 'spacePrivateCircle',
						alias: newSpace.name + "_" + "circle"
					}).then(function () {
						return $q.when(newSpace);
					})
				} else {
					return $q.when(newSpace);
				}
			})
		}

		service.updateSpace = function (spaceId, updateData, callback) {
			//put: /api/spaces/:id
			//return updated space
			if (!isNaN(spaceId) && spaceId > 0) {
				updateData.id = spaceId;
			} else {
				aSpace = service.getCurrentSpace();
				updateData.id = aSpace.id;
			}

			return resSpace.update(updateData,
				function (data) {
					return safeCb(callback)(null, data);
				},
				function (err) {
					return safeCb(callback)(err);
				}).$promise;
		};

		service.addSpaceType = function (spaceId, typeData, callback) {
			//post: /api/spaces/:id/addType
			//return space with type
			var saveData = {};
			saveData.id = spaceId;
			if (!isNaN(typeData) && typeData > 0) {
				saveData.typeId = typeData;
			}
			if (typeof typeData === 'object') {
				saveData = Object.assign(saveData, typeData);
			}
			return resSpace.addType(saveData,
				function (data) {
					return safeCb(callback)(null, data);
				},
				function (err) {
					return safeCb(callback)(err);
				}).$promise;
		}

		service.setCurrent = function (space) {
			return currentSpace = space;
		};

		service.current = function (callback) {
			if (arguments.length === 0) {
				return currentSpace;
			}

			var value = (currentSpace.hasOwnProperty('$promise')) ?
				currentSpace.$promise : currentSpace;

			return $q.when(value)
				.then(space => {
					safeCb(callback)(space);
					return space;
				}, () => {
					safeCb(callback)({});
					return {};
				});
		};

		service.userJoin = function (spaceId, userId, callback) {
			//get: /api/spaces/:id/userJoin
			//return boolean
			return resSpace.userJoin({
				id: spaceId,
				userId: userId
			},
				function (data) {
					return safeCb(callback)(null, data);
				},
				function (err) {
					return safeCb(callback)(err);
				}).$promise;
		};

		service.findAll = function (findData, callback) {

			if (angular.isObject(findData)) {
				return resSpace.query(findData).$promise.then(function (spaces) {
					return spaces[0];
				}).$promise;
			}

			//otherwise return error
			$q.reject('fail to find spaces!');
		};

		service.find = function (findData) {

			console.log('in find space: ');

			if ((angular.isNumber(findData) && findData > 0) || (parseInt(findData) && parseInt(findData) > 0)) {
				return resSpace.get({
					id: findData
				}).$promise;
			}

			if (angular.isObject(findData)) {
				return resSpace.query(findData).$promise.then(function (spaces) {
					console.log('spaces:', spaces);
					return spaces[0];
				}).$promise;
			}

			//otherwise return error
			$q.reject('fail to find space!');
		}

		service.addApp = function (spaceId, appName) {
			return BApp.create(spaceId, appName);
			//return BApp.joinSpace(spaceId, appName);
		}

		service.addApps = function (listOfAppData, spaceId) {
			return BApp.bulkAdd(listOfAppData, spaceId);
		}

		service.initRoles = function (spaceId) {

			return BRole.addRoles([{
				spaceId: spaceId,
				roleName: 'admin'
			}, {
					spaceId: spaceId,
					roleName: 'member'
				}, {
					spaceId: spaceId,
					roleName: 'customer'
				},]);
		}

		service.addRole = function (roleData) {

			if (angular.isString(roleData)) {
				roleData = { name: rootData };
				roleData.spaceId = $rootScope.current.space.id;
			}

			if (angular.isObject(roleData)) {
				if (!roleData.spaceId) {
					roleData.spaceId = $rootScope.current.space.id;
				}
			}

			return BRole.addRole(roleData)
		}

		service.getRole = function (roleData) {

			var findData = {};

			if (angular.isString(roleData)) {
				findData.spaceId = $rootScope.current.space._id;
				findData.name = rootData
			}

			if (angular.isObject(roleData)) {
				if (!roleData.spaceId) {
					roleData.spaceId = $rootScope.current.space._id;
				}
				findData = roleData;
			}

			return BRole.find(findData).$promise;
		}

		service.findRole = function (roleData) {
			return this.getRole(roleData);
		}

		service.getRoles = function (roleData) {
			var findData = {};
			findData.spaceId = $rootScope.current.space._id;

			if (angular.isString(roleData)) {
				findData.name = rootData
			}

			if (angular.isObject(roleData)) {
				if (!roleData.spaceId) {
					roleData.spaceId = $rootScope.current.space._id;
				}
				findData = roleData;
			}

			return BRole.findAll(findData).$promise;
		}

		service.findRoles = function (roleData) {
			return this.getRoles(roleData);
		}


		service.getSpaceUsers = function (id) {
			var res = $resource('/api/users/sp/:spaceId');
			return res.query({ spaceId: id }).$promise;
		}

		service.getConfig = function (spaceData) {
			var model = this;
			return $http.get('/components/blyn/core/space/config.json').then(function (res) {
				return $q.when(res.data);
			});
		}

		return service;
	}


	angular.module('billynApp.core')
		.factory('BSpace', SpaceService);

})();
