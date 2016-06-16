'use strict';

angular.module('billynApp.core')
    .config(function($stateProvider) {

        $stateProvider
            .state('pc.dashboard', {
                url: '/dashboard',
                templateUrl: 'components/blyn/core/dash/view/listMessage.html',
                controller: 'ListMessageController',
                controllerAs: 'listMessage',
                ncyBreadcrumb: { skip: true },
                authenticate: true
            })
            .state('pc.createSpace', {
                url: '/createSpace',
                templateUrl: 'components/blyn/core/dash/view/createSpace.html',
                controller: 'CreateSpaceController',
                controllerAs: 'vm',
                ncyBreadcrumb: { label: '创建机构' },
                authenticate: true
            })
            // .state('pc.createSpaceSummary', {
            //   url: '/createSpaceSummary/:id',
            //   templateUrl: 'components/blyn/core/dash/view/createSpace_summary.html',
            //   //controller: function ($stateParams) {
            //   //  console.log("statePrarms：", $stateParams);
            //   //},
            //   controller: 'CreateSpaceController',
            //   controllerAs: 'createSpace',
            //   authenticate: true
            // })
            .state('pc.joinSpace', {
                url: '/joinSpace',
                templateUrl: 'components/blyn/core/dash/view/joinSpace.html',
                controller: 'JoinSpaceController',
                controllerAs: 'joinSpace',
                ncyBreadcrumb: { label: '加入机构' },
                authenticate: true
            })
            .state('pc.profile', {
                url: '/profile',
                templateUrl: 'components/blyn/core/dash/view/profile.html',
                authenticate: true
                //controller: 'blyn.home.profile.showController',
                //controllerAs: 'showProfile'
            })
            .state('mobile.dashboard', {
                url: '/dashboard',
                templateUrl: 'components/blyn/core/dash/view/listMessage.mobile.html',
                controller: 'ListMessageController',
                controllerAs: 'listMessage',
                authenticate: true
            });
    });
