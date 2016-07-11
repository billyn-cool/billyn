'use strict';

(function() {
	class LayoutController {

		constructor(BSpace, BApp, $rootScope, $q) {

			var ctrl = this;
			//应该使用getUserSpaces这个函数去获取数据
			BSpace.getUserSpaces($rootScope.current.user._id).then(function(resources){
				ctrl.spaces = resources;
				angular.forEach(ctrl.spaces,function(space){
					var apps = space.apps;
					angular.forEach(apps, function(app){
						if(app.name === 'appEngine'){
							space.appEngine = app;
							var nuts = app.nuts;
							nuts.forEach(function(nut){
								if(nut.name === 'circle'){
									space.appEngine.circle = nut;
								}
							})
						}
					})
				})
				// Loop to get apps in each space.
				/*
				var proms = [];
				angular.forEach(ctrl.spaces, function(space){
					//var pro = BApp.findAppsInSpace(space._id);
					space.apps = [];
					var pf = BApp.findAppsInSpace(space._id).then(function(apps){							
							for(var prop in apps){
								space.apps.push(apps[prop]);
							}
						});
					proms.push(pf);
					//var apps = BApp.findAppsInSpace(space._id);
					//space.apps = apps ? apps : [];
				});
				return $q.all(proms).then(function(results){
					return ctrl.spaces;
				});*/
			},function(err) {
				console.log('err',err);
			});
		}
	}

	angular.module('billynApp')
		.controller('LayoutController', LayoutController);

}());