'use strict';

angular.module('billynApp.core')
  .config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.when(
      '/pc/space/:spaceId/app/:appId/collab/:nutId',
      '/pc/space/:spaceId/app/:appId/collab/:nutId/home');
    $urlRouterProvider.when(
      '/pc/space/:spaceId/app/:appId/collab/:nutId/adminCollab',
      '/pc/space/:spaceId/app/:appId/collab/:nutId/adminCollab/home');
    $urlRouterProvider.when(
      '/pc/space/:spaceId/app/:appId/collab/:nutId/shareCollabs',
      '/pc/space/:spaceId/app/:appId/collab/:nutId/shareCollabs/joinable');
    $urlRouterProvider.when(
      '/pc/space/:spaceId/app/:appId/collab/:nutId/joinCollabs',
      '/pc/space/:spaceId/app/:appId/collab/:nutId/joinCollabs/joinable');
    $urlRouterProvider.when(
      '/pc/space/:spaceId/app/:appId/collab/:nutId/collabNuts',
      '/pc/space/:spaceId/app/:appId/collab/:nutId/collabNuts/home');

    $stateProvider
      .state('pc.space.app.collab', {
        url: '/collab/:nutId',
        template: '<div ui-view=""></div>',
        controller: 'CollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '机构合作' },
        resolve: {
          currentNut: function ($q, $stateParams, $rootScope, BNut, currentSpace) {
            var nutId, collabId;
            if ($stateParams.nutId) {
              nutId = $stateParams.nutId;
            }
            if ($stateParams.collabId) {
              collabId = $stateParams.collabId;
            }

            if (nutId) {
              return BNut.find(nutId).then(function (nut) {
                $rootScope.current.nut = nut;
                $rootScope.current.nut.permits = [];
                if (collabId && collabId > 0) {
                  //BCollab.findAllUserPermitNut

                } else {
                  BNut.findAllUserPermitNut($rootScope.current.app._id).then(function (permitNuts) {
                    for (var i = 0; i < permitNuts.length; i++) {
                      if (permitNuts[i].nut && permitNuts[i].nut.name === 'collab') {
                        $rootScope.current.nut.permits.push(permitNuts[i].permit);
                      }
                    }
                    return nut;
                  });
                }
                return nut;
              })
            }

            $q.resolve('No nutId.');
          }
        }
      })
      .state('pc.space.app.collab.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/collab/view/home.html',
        controller: 'CollabHomeController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
      .state('pc.space.app.collab.adminCollab', {
        url: '/adminCollab',
        template: '<div ui-view=""></div>',
        //templateUrl: 'components/blyn/core/collab/view/adminCollab.html',
        controller: 'AdminCollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '设置关系' },
        authenticate: true
      })
      .state('pc.space.app.collab.adminCollab.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/collab/view/adminCollab.html',
        controller: 'AdminCollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
      .state('pc.space.app.collab.adminCollab.addCollab', {
        url: '/addCollab',
        templateUrl: 'components/blyn/core/collab/view/addCollab.html',
        controller: 'CreateCollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '新关系' },
        authenticate: true
      })
      .state('pc.space.app.collab.joinCollabs', {
        url: '/joinCollabs',
        template: '<div ui-view=""></div>',
        controller: 'ParentCollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '加入合作' },
        authenticate: true
      })
      .state('pc.space.app.collab.joinCollabs.joinable', {
        url: '/joinable',
        templateUrl: 'components/blyn/core/collab/view/joinableCollabs.html',
        controller: 'ParentCollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '未关注' },
        authenticate: true
      })
      .state('pc.space.app.collab.joinCollabs.joined', {
        url: '/joined',
        templateUrl: 'components/blyn/core/collab/view/joinedCollabs.html',
        controller: 'ParentCollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '已关注' },
        authenticate: true
      })
      .state('pc.space.app.collab.joinCollabs.join', {
        url: '/join?collabId',
        templateUrl: 'components/blyn/core/collab/view/joinCollab.html',
        controller: 'JoinCollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '加关注' },
        authenticate: true,
        resolve: {
          currentCollab: function ($q, $stateParams, $rootScope, BCollab) {
            return $stateParams.collabId ?
              BCollab.find($stateParams.collabId).then(function (collab) {
                $rootScope.current.collab = collab;
              }) :
              $q.resolve('No collabId.');
          }
        }
      })
      .state('pc.space.app.collab.shareCollabs', {
        url: '/shareCollabs',
        templateUrl: 'components/blyn/core/collab/view/shareCollabs.html',
        controller: 'ChildCollabController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '分享合作' },
        authenticate: true
      })
      .state('pc.space.app.collab.collabNuts', {
        url: '/collabNuts',
        template: '<div ui-view=""></div>',
        controller: 'CollabNutController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '合作功能' },
        authenticate: true
      })
      .state('pc.space.app.collab.collabNuts.home', {
        url: '/home',
        templateUrl: 'components/blyn/core/collab/view/collabNuts.html',
        controller: 'CollabNutController',
        controllerAs: 'vm',
        ncyBreadcrumb: { skip: true },
        authenticate: true
      })
  });
