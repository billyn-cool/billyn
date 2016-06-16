'use strict';

(function() {

	function PermitService($resource, User, $q, Util, $rootScope) {
		var safeCb = Util.safeCb;
		var resPermit = $resource('/api/permits/:id/:controller', {
			id: '@_id'
		}, {
			update: {
				method: 'PUT'
			},
			findOrCreate: {
				method: 'POST',
				id: 'findOrCreate'
			}
		});

		var resPermitRole = $resource('/api/permits/roles/:id/:controller', {
			id: '@_id'
		}, {
			update: {
				method: 'PUT'
			}
		});

		var currentPermit = {};

		var service = {};

		service.find = function(permitData){
			
			if(angular.isNumber(permitData) && permitData >0){
				return resPermit.get({
					id: permitData
				});
			}
			
			if(angular.isString(permitData)){
				permitData = {
					name: permitData
				};
			}
			
			if(typeof permitData === 'object'){
				if(!permitData.hasOwnProperty('spaceId')){
					permitData.spaceId = $rootScope.current.space._id;
				}
				
				return resPermit.get(permitData);	
			}
			
			//otherwise return error
			$q.reject('fail to find Permit');
		}

		service.findOrCreate = function(permitData){

			if(angular.isString(permitData)){
				permitData = {
					name: permitData
				};
			}
			
			if(typeof permitData === 'object'){
				if(!permitData.hasOwnProperty('spaceId')){
					permitData.spaceId = $rootScope.current.space._id;
				}
				
				return resPermit.findOrCreate(permitData);	
			}
		}
		
		service.findAll = function(permitData){
			if(angular.isString(permitData)){
				permitData = {
					name: permitData
				};
			}
			
			if(typeof permitData === 'object'){
				if(!permitData.hasOwnProperty('spaceId')){
					permitData.spaceId = $rootScope.current.space.id;
				}
				
				return resPermit.query(permitData);	
			}
			
			//otherwise return error
			$q.reject('fail to find Permits');
		}
		
		service.create = function(permitData){
			return this.addPermit(permitData);
		}
		
		//add Permit into space
		service.addPermit = function(permitData){
			
			if(angular.isString(permitData)){
				permitData = {
					name: permitData
				};
			}
			
			if(typeof permitData === 'object'){
				
				if(!permitData.hasOwnProperty('spaceId')){
					permitData.spaceId = $rootScope.current.space._id;//BSpace.current()._id;
				}
				return resPermit.save(permitData);			
			}
		}

		service.addPermitRole = function (permitRoleData) {
			// console.log('PermitData:',PermitData);
			  var saveRes =  resPermitRole.save(permitRoleData);
			  // console.log('saveRes',saveRes);
			  return saveRes.$promise;
		}
		
		service.deletePermitRole = function(permitRoleId){
			return resPermitRole.remove({id:permitRoleId}).$promise;
		}

		service.addBulkPermitRole = function(bulkPermitRoleData){
			var res = $resource('/api/permits/roles/bulk', {
				}, {
					addBulkPermitRole: {
						method: 'POST'
					}
				});
			return res.addBulkPermitRole(bulkPermitRoleData).$promise;			
		}

		service.findAllPermitRole = function (permitRoleData) {
			  return resPermitRole.query(permitRoleData).$promise;
			  // console.log('getRes',getRes);			  
		}

		service.findAllUserPermitRole = function (permitRoleData) {
			permitRoleData.id = 'user';
			if(!permitRoleData.spaceId){
				permitRoleData.spaceId = $rootScope.current.space._id;
			}
			if(!permitRoleData.userId){
				permitRoleData.userId = $rootScope.user.current._id;
			}
			
			return resPermitRole.query(permitRoleData).$promise;
			  // console.log('getRes',getRes);			  
		}

		return service;
	}

	angular.module('billynApp.core')
		.factory('BPermit', PermitService);

})();
