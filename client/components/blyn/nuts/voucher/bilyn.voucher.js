'use strict';

angular.module('billynApp.nut')
  .config(function ($stateProvider, $urlRouterProvider) {

 //   $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/voucher/:nutId/admin', '/pc/space/:spaceId/app/:appId/voucher/:nutId/admin/home');
    
   $urlRouterProvider.when('/pc/space/:spaceId/app/:appId/voucher/:nutId', '/pc/space/:spaceId/app/:appId/voucher/:nutId/home');
    
    $stateProvider
      .state('pc.space.app.voucher', {
        url: '/voucher/:nutId',
        template: '<div ui-view=""></div>',
        controller: 'VoucherController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label: '优惠券'}, // {skip:true},
        resolve: {
          permitNut: function ($q, $rootScope, BNut, currentApp) {
            return BNut.findAllUserPermitNut($rootScope.current.app._id).then(function(permitNuts) {
              for (var i = 0; i < permitNuts.length; i++) {
                if (permitNuts[i] && permitNuts[i].nut && permitNuts[i].nut.name == 'voucher') {
                  $rootScope.current.nut = permitNuts[i].nut;
                  return permitNuts[i];
                }
              }
              return $q.reject('permitNut not found.');
            });
            // return $stateParams.nutId ? BNut.findNut($stateParams.nutId) : $q.reject('No nutId.');
          }
        },
        authenticate: true
      })
       .state('pc.space.app.voucher.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/voucher/view/home.html',
        controller: 'VoucherHomeController',
        controllerAs: 'vm',
        ncyBreadcrumb: {skip:true},
        // resolve: {
        //   permitNut: function ($q, $rootScope, BNut, currentApp) {
        //     return BNut.findAllUserPermitNut($rootScope.current.app._id).then(function(permitNuts) {
        //       for (var i = 0; i < permitNuts.length; i++) {
        //         if (permitNuts[i] && permitNuts[i].nut && permitNuts[i].nut.name == 'voucher') {
        //           $rootScope.current.nut = permitNuts[i].nut;
        //           return permitNuts[i];
        //         }
        //       }
        //       return $q.reject('permitNut not found.');
        //     });
        //     // return $stateParams.nutId ? BNut.findNut($stateParams.nutId) : $q.reject('No nutId.');
        //   }
        // },
        authenticate: true
      })
       .state('pc.space.app.voucher.adminVoucher', {
        url: '/adminVoucher',
        template: '<div ui-view=""></div>',
        controller: 'AdminVoucherController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label: 'Admin优惠券'}, // {skip:true},
        authenticate: true
      })
       .state('pc.space.app.voucher.adminVoucher.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/voucher/view/adminVoucher.html',
        controller: 'AdminVoucherHomeController',
        controllerAs: 'vm',
        ncyBreadcrumb: {skip:true},
        authenticate: true
      })
      
      .state('pc.space.app.voucher.admin', {
        url: '/admin',
        templateUrl: '<div ui-view=""></div>',
        // controller: 'VoucherAdminController',
        // controllerAs: 'vm',
        ncyBreadcrumb: {label: '优惠券'},
        authenticate: true
      })
      .state('pc.space.app.voucher.admin.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/voucher/view/admin.home.html',
        controller: 'VoucherAdminHomeController',
        controllerAs: 'vm',
        ncyBreadcrumb: {skip:true},
        authenticate: true
      })
      .state('pc.space.app.voucher.admin.addVoucher', {
        url: '/addvoucher/:voucherId',
        templateUrl: 'components/blyn/nuts/voucher/view/admin.voucher.add.html',
        controller: 'VoucherAdminAddVoucherController',
        controllerAs: 'vm',
        ncyBreadcrumb: { label: '{{breadcrumb.addVoucher}}' },
        authenticate: true
      })
      .state('pc.space.app.voucher.admin.typeList', {
        url: '/typelist',
        templateUrl: 'components/blyn/nuts/voucher/view/admin.type.list.html',
        controller: 'VoucherAdminTypeListController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label: '优惠券类型'},
        authenticate: true
      })
      .state('pc.space.app.voucher.admin.addType', {
        url: '/addtype/:typeId',
        templateUrl: 'components/blyn/nuts/voucher/view/admin.type.add.html',
        controller: 'VoucherAdminAddTypeController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label: '{{breadcrumb.addType}}'},
        authenticate: true
      })
      .state('mobile.voucher', {
        url: '/voucher',
        templateUrl: 'components/blyn/nuts/voucher/view/voucher.mobile.html',
        controller: 'VoucherController',
        controllerAs: 'voucher',
        authenticate: true
      })
      .state('mobile.voucher.valid', {
        url: '/valid',
        templateUrl: 'components/blyn/nuts/voucher/view/voucher.list.mobile.html',
        ncyBreadcrumb: {skip:true},
        authenticate: true
      })
      .state('mobile.voucher.invalid', {
        url: '/invalid',
        templateUrl: 'components/blyn/nuts/voucher/view/voucher.list.mobile.html',
        ncyBreadcrumb: {skip:true},
        authenticate: true
      });
  });
