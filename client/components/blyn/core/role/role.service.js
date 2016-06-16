'use strict';

(function () {

	function RoleService($resource, User, $q, Util, $rootScope) {
		var safeCb = Util.safeCb;

		var resRole = $resource('/api/roles/:id/:controller', {
			id: '@_id'
		}, {
				find: {
					method: 'GET',
					params: {
						id: 'find'
					}
				},
				addGrants: {
					method: 'POST',
					isArray: true,
					params: {
						id: 'grants'
					}
				}
			});

		var currentRole = {};

		var service = {};

		service.find = function (roleData) {

			if (angular.isNumber(roleData) && roleData > 0) {
				return resRole.get({
					id: roleData
				});
			}

			if (angular.isString(roleData)) {
				roleData = {
					name: roleData
				};
			}

			if (typeof roleData === 'object') {
				if (!roleData.hasOwnProperty('spaceId')) {
					roleData.spaceId = $rootScope.current.space._id;
				}

				return resRole.find(roleData);
			}

			//otherwise return error
			//return $q.reject('fail to find role');
		}

		service.findAll = function (roleData) {
			if (angular.isString(roleData)) {
				roleData = {
					name: roleData
				};
			}

			if (typeof roleData === 'object') {
				if (!roleData.hasOwnProperty('spaceId')) {
					roleData.spaceId = $rootScope.current.space.id;
				}

				return resRole.query(roleData);
			}

			//otherwise return error
			$q.reject('fail to find roles');
		}

		service.create = function (roleData) {
			return this.addRole(roleData);
		}

		//add role into space
		//
		service.addRole = function (roleData) {

			if (angular.isString(roleData)) {
				roleData = {
					name: roleData
				};
			}

			if (typeof roleData === 'object') {

				if (!roleData.hasOwnProperty('spaceId')) {
					roleData.spaceId = $rootScope.current.space._id;//BSpace.current()._id;
				}
				return resRole.save(roleData);
			}
		}

		service.deleteRole = function (roleId) {

			var res = $resource('/api/roles/:id');

			return res.delete({ id: roleId }).$promise;

		}

		service.addUserRole = function (roleData) {
			// console.log('roleData:',roleData);
			//  var saveRes =  resRole.save({id:'user'},roleData);
			// console.log('saveRes',saveRes);

			var saveRes = $resource('/api/roles/user/');
			return saveRes.save(roleData).$promise;
		}

		service.addUserRoleBatch = function (roleData) {
			var saveRes = $resource('/api/roles/users/batch',
				null,
				{ save: { method: 'post', isArray: true } });

			return saveRes.save(roleData).$promise;
		}


		service.deleteUserRole = function (roleData) {
			// console.log('roleData:',roleData);
			var saveRes = resRole.save({ id: 'user' }, roleData);
			// console.log('saveRes',saveRes);
			return saveRes;
		}

		service.getSpaceRoles = function (spaceId) {

            var spaceRoles = $resource('/api/roles?spaceId=:id', { id: '@_id' });
            return spaceRoles.query({ id: spaceId }).$promise;

		}

       	service.addChild = function (parentId, roleData) {

            var spaceRoles = $resource('/api/roles/:id', { id: '@_id' });
            return spaceRoles.save({ id: parentId }, roleData).$promise;

		}

		service.getUserRoleInSpace = function (userId, spaceId) {

            var userRoles = $resource('/api/roles?userId=:uId&spaceId=:sId');
            return userRoles.query({ uId: userId, sId: spaceId }).$promise;
		}

		service.addGrants = function (grantsData, ownerData) {

			return resRole.addGrants({
				grants: grantsData,
				ownerData: ownerData
			}).$promise;
		}

		return service;
	}

	angular.module('billynApp.core')
		.factory('BRole', RoleService);

})();
