'use strict';

angular.module('billynApp')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/pc/space/:spaceId', '/pc/space/:spaceId/home');
    $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/space/:nutId', '/pc/space/:spaceId/app/:appId/space/:nutId/home');
    $urlRouterProvider.when('/pc/space/app/space/appstore', '/pc/space/app/space/appstore/add');

    $stateProvider
      .state('pc.space', {
        url: '/space/:spaceId',
        template: '<div ui-view=""></div>',
        controller: 'SpaceController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label: '{{breadcrumb.space}}'},
        resolve: {
          currentSpace: function($q, $stateParams, $rootScope, BSpace, currentUser) {
            // If return a promise with rejected, the controller of this state will not be instantiated.
            return $stateParams.spaceId ? 
                    BSpace.getSpace($stateParams.spaceId).then(function (space) {
                      $rootScope.current.space = space;
                      $rootScope.breadcrumb.space = space.alias;
                    }) : 
                    $q.resolve('No spaceId.');
          }
        }
      })
      .state('pc.space.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/space/view/spaceHome.html',
        controller: 'SpaceHomeController',
        controllerAs: 'vm',
        ncyBreadcrumb: {skip:true},
        authenticate: true
      })
      .state('pc.space.app.space', {
        url: '/space/:nutId',
        template: '<div ui-view=""></div>',
        controller: 'SpaceController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '机构设置' },
        resolve: {
          permitNut: function ($q, $rootScope, BNut, currentApp) {
            return BNut.findAllUserPermitNut($rootScope.current.app._id).then(function (permitNuts) {
              for (var i = 0; i < permitNuts.length; i++) {
                if (permitNuts[i].nut.name == 'space') {
                  $rootScope.current.nut = permitNuts[i].nut;
                  return permitNuts[i];
                }
              }
              return $q.reject('permitNut not found.');
            });
            // return $stateParams.nutId ? BNut.findNut($stateParams.nutId) : $q.reject('No nutId.');
          }
        }
      })
      .state('pc.space.app.space.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/space/view/home.html',
        controller: 'SpaceHomeController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true }
      })
      .state('pc.space.app.space.appStore', {
        url: '/appstore',
        template: '<div ui-view=""></div>',
        controller: 'AppStoreController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label:'应用商店'}
      })
      .state('pc.space.app.space.appStore.home', {
        url: '/appstore',
        templateUrl: 'components/blyn/core/space/view/appStore.html',
        controller: 'AppStoreController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true }
      })
      .state('pc.space.app.space.appStore.add', {
        url: '/add',
        templateUrl: 'components/blyn/core/space/view/addApp.html',
        controller: 'AddAppController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label:'增加应用'},
        authenticate: true
      })
      .state('pc.space.app.space.appStore.delete', {
        url: '/delete',
        templateUrl: 'components/blyn/core/space/view/deleteApp.html',
        controller: 'DeleteAppController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label:'卸载应用'},
        authenticate: true
      });
  });
