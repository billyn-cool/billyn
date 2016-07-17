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
    $urlRouterProvider.when(
      '/pc/space/:spaceId/app/:appId/circle/:nutId/circleMemberChief',
      '/pc/space/:spaceId/app/:appId/circle/:nutId/circleMemberChief/home');
    $urlRouterProvider.when(
      '/pc/space/:spaceId/app/:appId/circle/:nutId/circleMemberChief/:circleId/listCollab',
      '/pc/space/:spaceId/app/:appId/circle/:nutId/circleMemberChief/:circleId/listCollab/home'),
    $urlRouterProvider.when(
      '/pc/space/:spaceId/app/:appId/circle/:nutId/circleMember',
      '/pc/space/:spaceId/app/:appId/circle/:nutId/circleMember/home');


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
      .state('pc.space.app.circle.manageCircle.spaces', {
        url: '/:circleId/spaces',
        templateUrl: 'components/blyn/core/circle/view/manageCircleSpaces.html',
        controller: 'ManageCircleSpacesController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '管理圈子机构' },
        authenticate: true,
        resolve: {
          currentCircle: function ($q, $stateParams, $rootScope, BCircle) {
            return $stateParams.circleId ?
              BCircle.find($stateParams.circleId).then(function (circle) {
                $rootScope.current.circle = circle;
              }) :
              $q.resolve('No circleId.');
          }
        }
      })
      .state('pc.space.app.circle.manageCircle.addCollab', {
        url: '/:circleId/addCollab',
        templateUrl: 'components/blyn/core/circle/view/addCircleCollab.html',
        controller: 'ManageCircleCollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '加协作' },
        authenticate: true,
        resolve: {
          currentCircle: function ($q, $stateParams, $rootScope, BCircle) {
            return $stateParams.circleId ?
              BCircle.find($stateParams.circleId).then(function (circle) {
                $rootScope.current.circle = circle;
              }) :
              $q.resolve('No circleId.');
          }
        }
      })
      .state('pc.space.app.circle.circleMemberChief', {
        url: '/circleMemberChief',
        template: '<div ui-view=""></div>',
        //templateUrl: 'components/blyn/core/circle/view/adminCircle.html',
        controller: 'CircleMemberChiefController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '管理机构关注' },
        authenticate: true
      })
      .state('pc.space.app.circle.circleMemberChief.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/circle/view/circleMemberChief.html',
        controller: 'CircleMemberChiefController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
      .state('pc.space.app.circle.circleMemberChief.joinCircle', {
        url: '/joinCircle',
        templateUrl: 'components/blyn/core/circle/view/joinCircle.html',
        controller: 'CircleMemberChiefController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '关注机构圈' },
        authenticate: true
      })
      .state('pc.space.app.circle.circleMemberChief.shareCollab', {
        url: '/:circleId/shareCollab',
        templateUrl: 'components/blyn/core/circle/view/shareCollab.html',
        controller: 'ShareCollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '申请功能分享' },
        authenticate: true,
        resolve: {
          currentCircle: function ($q, $stateParams, $rootScope, BCircle) {
            return $stateParams.circleId ?
              BCircle.find($stateParams.circleId).then(function (circle) {
                $rootScope.current.circle = circle;
              }) :
              $q.resolve('No circleId.');
          }
        }
      })
      .state('pc.space.app.circle.circleMemberChief.listCollab', {
        url: '/:circleId/listCollab',
        template: '<div ui-view=""></div>',
        //templateUrl: 'components/blyn/core/circle/view/adminCircle.html',
        controller: 'CircleMemberChiefController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '圈子功能' },
        authenticate: true,
        resolve: {
          currentCircle: function ($q, $stateParams, $rootScope, BCircle) {
            return $stateParams.circleId ?
              BCircle.find($stateParams.circleId).then(function (circle) {
                $rootScope.current.circle = circle;
              }) :
              $q.resolve('No circleId.');
          }
        }
      })
      .state('pc.space.app.circle.circleMemberChief.listCollab.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/circle/view/listCollab.html',
        controller: 'ListCircleCollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true,      
      })
      .state('pc.space.app.circle.circleMemberChief.listCollab.joinCollab', {
        url: '/joinCollab/:joinedSpaceId/:collabId',
        templateUrl: 'components/blyn/core/circle/view/joinCollab.html',
        controller: 'JoinCircleCollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '关注功能' },
        authenticate: true,
      })
      .state('pc.space.app.circle.circleMember', {
        url: '/circleMember',
        template: '<div ui-view=""></div>',
        //templateUrl: 'components/blyn/core/circle/view/adminCircle.html',
        controller: 'CircleMemberController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '我的机构圈' },
        authenticate: true
      })
      .state('pc.space.app.circle.circleMember.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/circle/view/circleMember.html',
        controller: 'CircleMemberController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
      .state('pc.space.app.circle.circleMember.spaces', {
        url: '/:circleId/spaces',
        templateUrl: 'components/blyn/core/circle/view/circleMemberSpaces.html',
        controller: 'CircleMemberSpacesController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '圈子机构' },
        authenticate: true
      })

  });
