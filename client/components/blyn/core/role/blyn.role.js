'use strict';

angular.module('billynApp.core')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/role/:nutId', '/pc/space/:spaceId/app/:appId/role/:nutId/home');
    $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/role/:nutId/adminSpaceRole', '/pc/space/:spaceId/app/:appId/role/:nutId/adminSpaceRole/home');
    $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/role/:nutId/adminUserRole', '/pc/space/:spaceId/app/:appId/role/:nutId/adminUserRole/home');

    //    $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/role/:nutId/admin', '/pc/space/:spaceId/app/:appId/role/:nutId/admin/home');
    //   $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/role/:nutId/admin/home', '/pc/space/:spaceId/app/:appId/role/:nutId/admin/home/space');

    $stateProvider
      .state('pc.space.app.role', {
        url: '/role/:nutId',
        template: '<div ui-view=""></div>',
        controller: 'RoleController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '角色管理' },
        resolve: {
          permitNut: function ($q, $rootScope, BNut, currentApp) {
            return BNut.findAllUserPermitNut($rootScope.current.app._id).then(function (permitNuts) {
              for (var i = 0; i < permitNuts.length; i++) {
                if (permitNuts[i].nut.name == 'role') {
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
      .state('pc.space.app.role.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/role/view/home.html',
        controller: 'RoleHomeController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true }
      })
      .state('pc.space.app.role.adminSpaceRole', {
        url: '/adminSpaceRole',
        template: '<div ui-view=""></div>',
        controller: 'AdminSpaceRoleController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '机构角色管理' },
        authenticate: true
      })
      .state('pc.space.app.role.adminSpaceRole.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/role/view/spaceRole.html',
        controller: 'AdminSpaceRoleController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
      .state('pc.space.app.role.adminUserRole', {
        url: '/adminUserRole',
        template: '<div ui-view=""></div>',
        controller: 'AdminUserRoleController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '用户角色管理' },
        authenticate: true
      })
      .state('pc.space.app.role.adminUserRole.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/role/view/userRole.html',
        controller: 'AdminUserRoleController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
      .state('pc.space.app.role.member', {
        url: '/member',
        templateUrl: 'components/blyn/core/role/view/memberHome.html',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
      .state('pc.space.app.role.customer', {
        url: '/customer',
        templateUrl: 'components/blyn/core/role/view/customerHome.html',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      });

    // .state('pc.space.app.role.admin', {
    //   url: '/admin',
    //   template: '<div ui-view=""></div>',
    //   controller: 'RoleAdminController',
    //   controllerAs: 'vm',
    //   ncyBreadcrumb: {skip:true},
    //   authenticate: true
    // })
    // .state('pc.space.app.role.admin.home', {
    //   url: '/home',
    //   templateUrl: 'components/blyn/core/role/view/adminHome.html',
    //   controller: 'RoleAdminHomeController',

    //   controllerAs: 'vm',
    //   ncyBreadcrumb: {skip:true},
    //   authenticate: true
    // }) 
    // .state('pc.space.app.role.admin.home.user', {
    //   url: '/user',
    // //   template: 'this is user',
    //   templateUrl: 'components/blyn/core/role/view/userRole.html',
    //   controller: 'UserRoleController',
    //   controllerAs: 'vm',
    //   ncyBreadcrumb: {label:'用户角色管理'},
    //   authenticate: true
    // })
    //  .state('pc.space.app.role.admin.home.space', {
    //   url: '/space',
    // //   template: 'this is space',
    //   templateUrl: 'components/blyn/core/role/view/spaceRole.html',
    //   controller: 'SpaceRoleController',
    //   controllerAs: 'vm',
    //   ncyBreadcrumb: {label:'机构角色管理'},
    //   authenticate: true
    // })
    // .state('pc.space.app.role.admin.addRole', {
    //   url: '/addrole',
    //   templateUrl: 'components/blyn/core/role/view/adminAddRole.html',
    //   controller: 'RoleAdminAddRoleController',
    //   controllerAs: 'vm',
    //   ncyBreadcrumb: {label:'添加角色'},
    //   authenticate: true,
    //   params: {
    //       parent: null
    //   }
    // })

  });
