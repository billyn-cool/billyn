'use strict';

angular.module('billynApp.core')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when(
      '/pc/space/:spaceId/app/:appId',
      '/pc/space/:spaceId/app/:appId/home');

    $stateProvider
      .state('pc.space.app', {
        url: '/app/:appId',
        template: '<div ui-view=""></div>',
        controller: 'AppController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label: '{{breadcrumb.app}}'},
        resolve: {
          currentApp: function($q, $stateParams, $rootScope,$http, BApp, currentSpace) {
            return $stateParams.appId ? 
                    BApp.find($stateParams.appId).$promise.then(function (app) {
                      $rootScope.current.app = app;
                      $rootScope.breadcrumb.app = app.alias;
                    }) : 
                    $q.resolve('No appId.');
          }
        }
      })
      .state('pc.space.app.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/app/view/appHome.html',
        controller: 'AppHomeController',
        controllerAs: 'vm',
        ncyBreadcrumb: {skip:true},
        authenticate: true
      })
      .state('pc.space.app.adminNutPermit', {
        url: '/adminNutPermit/:nutId',
        templateUrl: 'components/blyn/core/app/view/admin.nutPermit.html',
        controller: 'NutPermitController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label: '设置权限'},
        authenticate: true,
        resolve: {
          nutId: function ($stateParams) {
            return $stateParams.nutId;
          }
        }
      });
  });
