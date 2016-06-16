'use strict';

angular.module('billynApp')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/', '/pc/dashboard');
    $urlRouterProvider.when('/pc', '/pc/dashboard');

    $stateProvider
      .state('pc', {
        url: '/pc',
        templateUrl: 'components/layout/view/layout.html',
        controller: 'LayoutController',
        controllerAs: 'layout',
        ncyBreadcrumb: {label:'机构书签'},
        resolve: {
          currentUser: function ($rootScope, Auth) {
            $rootScope.current.user = Auth.getCurrentUser();
          }
        }
      })
      .state('mobile', {
        url: '/mobile',
        templateUrl: 'components/layout/view/layout.mobile.html',
        controller: 'LayoutController',
        controllerAs: 'layout'
      });
  });
