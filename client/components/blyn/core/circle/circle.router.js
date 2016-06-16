'use strict';

angular.module('billynApp.core')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when(
      '/pc/space/:spaceId/app/:appId/circle/:nutId',
      '/pc/space/:spaceId/app/:appId/circle/:nutId/home');
    $urlRouterProvider.when(
      '/pc/space/:spaceId/app/:appId/circle/:nutId/adminCircle',
      '/pc/space/:spaceId/app/:appId/circle/:nutId/adminCircle/home');
    $urlRouterProvider.when(
      '/pc/space/:spaceId/app/:appId/circle/:nutId/manageCircle',
      '/pc/space/:spaceId/app/:appId/circle/:nutId/manageCircle/home');

    $stateProvider
      .state('pc.space.app.circle', {
        url: '/circle/:nutId',
        template: '<div ui-view=""></div>',
        controller: 'CircleController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '机构圈' },
        resolve: {
          currentNut: function ($q, $stateParams, $rootScope, BNut, currentSpace) {
            return $stateParams.nutId ?
              BNut.find($stateParams.nutId).then(function (nut) {
                $rootScope.current.nut = nut;
                $rootScope.current.nut.permits = [];
                BNut.findAllUserPermitNut($rootScope.current.app._id).then(function (permitNuts) {
                  for (var i = 0; i < permitNuts.length; i++) {
                    if (permitNuts[i].nut && permitNuts[i].nut.name === 'circle') {
                      $rootScope.current.nut.permits.push(permitNuts[i].permit);
                    }
                  }
                });
              }) :
              $q.resolve('No nutId.');
          }
        }
      })
      .state('pc.space.app.circle.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/circle/view/home.html',
        controller: 'CircleHomeController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
      .state('pc.space.app.circle.adminCircle', {
        url: '/adminCircle',
        template: '<div ui-view=""></div>',
        //templateUrl: 'components/blyn/core/circle/view/adminCircle.html',
        controller: 'AdminCircleController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '设置机构圈' },
        authenticate: true
      })
      .state('pc.space.app.circle.adminCircle.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/circle/view/adminCircle.html',
        controller: 'AdminCircleController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
      .state('pc.space.app.circle.adminCircle.addCircle', {
        url: '/addCircle',
        templateUrl: 'components/blyn/core/circle/view/addCircle.html',
        controller: 'CreateCircleController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '创建机构圈' },
        authenticate: true
      })
      .state('pc.space.app.circle.adminCircle.joinCircle', {
        url: '/joinCircle',
        templateUrl: 'components/blyn/core/circle/view/joinCircle.html',
        controller: 'JoinCircleController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '关注机构圈' },
        authenticate: true
      })
      .state('pc.space.app.circle.manageCircle', {
        url: '/manageCircle',
        template: '<div ui-view=""></div>',
        //templateUrl: 'components/blyn/core/circle/view/adminCircle.html',
        controller: 'ManageCircleController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '管理机构圈' },
        authenticate: true
      })
      .state('pc.space.app.circle.manageCircle.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/circle/view/manageCircle.html',
        controller: 'ManageCircleController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })

  });
