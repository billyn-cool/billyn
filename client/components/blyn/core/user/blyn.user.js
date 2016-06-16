'use strict';

angular.module('billynApp.core')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/user/:nutId', '/pc/space/:spaceId/app/:appId/user/:nutId/home');

    $stateProvider
      .state('pc.space.app.user', {
        url: '/user/:nutId',
        template: '<div ui-view=""></div>',
        controller: 'UserController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label:'用户管理'}
      })
      .state('pc.space.app.user.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/user/view/userHome.html',
        controller: 'UserHomeController',
        controllerAs: 'vm',
        ncyBreadcrumb: {skip:true},
        authenticate: true
      })
      .state('pc.space.app.user.assignRole', {
        url: '/assignrole',
        templateUrl: 'components/blyn/core/user/view/assignRole.html',
        controller: 'AssignRoleController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label:'分配角色'},
        authenticate: true,
        params: {
            currentUser: null
        }
      })        
       .state('pc.space.app.user.deleteRole', {
        url: '/deleteRole',
        templateUrl: 'components/blyn/core/user/view/deleteRole.html',
        controller: 'DeleteRoleController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label:'删除角色'},
        authenticate: true,
        params: {
            currentUser: null
        }
      });
  });
