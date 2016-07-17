'use strict';

(function () {

	function CollabService($resource, User, $q, Util, $http, BNut, $rootScope) {
		var safeCb = Util.safeCb;
		var resCollab = $resource('/api/collabs/:id/:controller', {
			id: '@_id'
		}, {
				findUserCollabs: {
					method: 'GET',
					params: {
						id: 'user'
					}
				},
				bulkCreate: {
					method: 'POST',
					isArray: true,
					params: {
						id: 'bulk'
					}
				},
				findAllJoinableSpace: {
					method: 'GET',
					isArray: true,
					params: {
						id: 'spaces',
						controller: 'joinable'
					}
				},
				findAllJoinedSpace: {
					method: 'GET',
					isArray: true,
					params: {
						id: 'spaces',
						controller: 'joined'
					}
				},
				findAllUserCollabNut: {
					method: 'GET',
					isArray: true,
					params: {
						id: 'user',
						controller: 'nuts'
					}
				}
			});

		var resCollabRole = $resource('/api/collabs/roles/:id/:controller', {
			id: '@_id'
		}, {
				bulkAdd: {
					method: "POST",
					isArray: true,
					params: {
						id: 'bulk'
					}
				}
			});

		var service = {};

		//working on collab table

		service.findCollab = function (collabData) {

			if (!isNaN(collabData) && collabData > 0) {
				return resCollab.get({ id: collabData }).$promise.then(function (collab) {
					return $q.when(collab);
				});
			}

			if (angular.isObject(collabData)) {
				return resCollab.get(collabData).$promise;
			}

			//otherwise return error
			$q.reject('fail to find collab, please provide valide params!');
		}

		service.find = function (collabData) {
			return this.findCollab(collabData);
		}

		service.findAllCollab = function (collabData) {

			if (angular.isObject(collabData)) {
				return resCollab.query(collabData).$promise;
			} else {
				//otherwise return error
				$q.reject('fail to find collabs, please provide valide params!');
			}
		}

		service.findSpaceCollabs = function (collabData) {
			collabData = angular.isObject(collabData) ? collabData : {};
			collabData.spaceId = collabData.spaceId || $rootScope.current.space._id;
			return this.findAllCollab(collabData);
		}

		service.findAll = function (collabData) {
			return this.findAllCollab(collabData);
		}

		service.createCollab = function (collabData) {

			var collabs;
			var proms = [];
			var that = this;
			var collab;

			if (angular.isObject(collabData)) {

				if (!collabData.spaceId) {
					collabData.spaceId = $rootScope.current.space._id;
				}

				return resCollab.save(collabData).$promise;

				/*
				return resCollab.save(collabData).$promise.then(function (result) {
					collab = result;
					//read config to get default collabs for collab
					var path = '/components/blyn/cores/collab/config.json';
					return $http.get(path).then(function (config) {
						var collabTypes = config.data.collabTypes;
						var collabs = collabTypes[collab.type.name]["defaultCollabs"];
						collabs.forEach(function (collab) {
							collab.space = $rootScope.current.space._id;
						})
						if (angular.isObject(collabs)) {
							return resCollab.bulkCreate(collabs).$promise.then(function (results) {
								//after create collabs for collab, also need to add collab role according 
								//to config
								results.forEach(function (o) {
									collabs.forEach(function (c) {
										if (c.name == o.name) {
											proms.push(that.addCollabParentRole({
												collabId: o._id,
												parentRoles: c.parentRoles
											}))
										}
									})
								});
								return $q.all(proms);
								//find collab again after create collabs
								//return resCollab.find(collab._id).$promise;
							}).$promise.then(function(){
								return resCollab.find(collab._id).$promise;
							})
						} else {
							return collab;
						}
					})
				})*/
			}

			//otherwise return error
			$q.reject('fail to create collab, please provide valide params!');
		}

		service.updateCollab = function (updateData, findData) {

			if (updateData && angular.isObject(updateData)) {

				if (findData && angular.isObject(findData)) {

					this.find(findData).then(function (collab) {

						updateData.id = collab._id;

						return resCollab.update(updatedData).$promise;
					})
				}
				else {
					return resCollab.update(updatedData).$promise;
				}
			}

			//otherwise return error
			$q.reject('fail to update collabs, please provide valide params!');
		}

		service.deleteCollab = function (collabData) {

			if (angular.isNumber(collabData) && collabData > 0) {

				return resCollab.destroy({
					_id: collabData
				});
			}

			//otherwise return error
			$q.reject('fail to destroy collab, please provide valide params!');
		}

		//working on collab role table

		service.findCollabRole = function (collabRoleData) {

			if (angular.isNumber(collabRoleData) && collabRoleData > 0) {
				return resCollab.findCollabRole({ id: collabRoleData }).$promise;
			}

			if (angular.isObject(collabRoleData)) {
				return resCollabRole.get(collabRoleData).$promise;
			}

			//otherwise return error
			$q.reject('fail to find collab role, please provide valide params!');
		}

		service.findAllCollabRole = function (collabRoleData) {

			if (angular.isObject(collabRoleData)) {
				return resCollabRole.findAllCollabRole(collabRoleData).$promise;
			}

			//otherwise return error
			$q.reject('fail to find collab roles, please provide valide params!');
		}

		service.addCollabRole = function (collabRoleData) {

			if (angular.isObject(collabRoleData)) {
				return resCollabRole.save(collabRoleData).$promise;
			}

			//otherwise return error
			$q.reject('fail to create collab, please provide valide params!');
		}

		service.bulkAddCollabRole = function (collabRoleData) {
			if (angular.isObject(collabRoleData)) {
				return resCollabRole.bulkAdd(collabRoleData).$promise;
			}

			//otherwise return error
			$q.reject('fail to add collabRoles, please provide valide params!');
		}

		service.deleteCollabRole = function (collabRoleData) {

			if (angular.isNumber(collabRoleData) && collabRoleData > 0) {

				return resCollabRole.destroyCollabRole({
					_id: collabRoleData
				});
			}

			//otherwise return error
			$q.reject('fail to destroy collab role, please provide valide params!');
		}

		//find user's nuts under some collab
		service.findAllUserCollabNut = function (findData) {
			var userId = $rootScope.current.user._id;
			var spaceId = $rootScope.current.space._id;

			//resource return nut and permits are organized by spaces
			return resCollab.findAllUserCollabNut({
				userId: userId,
				spaceId: spaceId
			}).$promise.then(function (spaces) {
				spaces.forEach(function (space) {
					var collabs = space.collabs;
					collabs.forEach(function (collab) {
						var nutPermits = [];
						var parentRoles = collab.parentRoles;
						parentRoles.forEach(function (r) {
							nutPermits = nutPermits.concat(r.nutPermits);
						})
						collab.nutPermits = nutPermits;
					})
				})
				return $q.when(spaces);
			})

		}

		service.findAllUserNutPermitWithCollab = function (findData) {
			this.findAllUserCollabNut().then(function (spaces) {
				spaces.forEach(function (space) {
					var collabs = space.collabs;
					collabs.forEach(function (collab) {
						var nutPermits = [];
						var parentRoles = collab.parentRoles;
						parentRoles.forEach(function (r) {
							nutPermits = nutPermits.concat(r.nutPermits);
						})
						collab.nutPermits = nutPermits;
					})
				})
			})

		}

		service.findUserJoinedCollabs = function (findData) {
			var spaceId = $rootScope.current.space._id;
			if (angular.isObject(findData) && findData.spaceId) {
				spaceId = findData.spaceId;
			}
			return resCollab.findUserCollabs({ spaceId: spaceId, userId: $rootScope.current.user._id }).$promise;
		}

		service.findUserLocalCollabs = function (findData) {
			return this.findAllCollab(findData).then(function (collabs) {
				return BNut.findUserNutPermits(
					{
						userId: $rootScope.current.user._id,
						nutId: $rootScope.current.nut._id
					}
				).then(function (nutPermits) {
					collabs.forEach(function (collab) {
						collab.userNutPermits = nutPermits;
					})
					return $q.when(collabs);
				});
			});
		}

		service.findAllJoinableSpace = function (findData) {
			var data = {};
			data.spaceId = $rootScope.current.space._id;
			if (angular.isObject(findData) && findData.spaceId) {
				data.spaceId = findData.spaceId;
			}
			return resCollab.findAllJoinableSpace(data).$promise;
		}

		service.findAllJoinedSpace = function (findData) {
			var data = {};
			data.spaceId = $rootScope.current.space._id;
			if (angular.isObject(findData) && findData.spaceId) {
				data.spaceId = findData.spaceId;
			}
			return resCollab.findAllJoinedSpace(data).$promise;
		}

		return service;
	}

	angular.module('billynApp.core')
		.factory('BCollab', CollabService);

})();
