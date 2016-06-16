'use strict';

angular.module('billynApp')
  .config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.when('/pc/settings', '/pc/settings/profile');

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginController',
        controllerAs: 'vm'
      })
      .state('logout', {
        url: '/logout?referrer',
        referrer: 'login',
        template: '',
        controller: function($state, Auth) {
          var referrer = $state.params.referrer ||
                          $state.current.referrer ||
                          'login';
          Auth.logout();
          $state.go(referrer);
        }
      })
      .state('signup', {
        url: '/signup',
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupController',
        controllerAs: 'vm'
      })
      .state('pc.settings', {
        url: '/settings',
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsController',
        controllerAs: 'vm',
        ncyBreadcrumb: {label:'设置'},
        authenticate: true
      })
      .state('pc.settings.profile', {
        url: '/profile',
        templateUrl: 'app/account/settings/profile.html',
        controller: 'ProfileController',
        controllerAs: 'vm',
        ncyBreadcrumb: {skip:true},
        authenticate: true
      })
      .state('pc.settings.changePassword', {
        url: '/changepassword',
        templateUrl: 'app/account/settings/changePassword.html',
        ncyBreadcrumb: {label:'修改密码'},
        authenticate: true
      })
      .state('mobile.profile', {
        url: '/profile',
        templateUrl: 'app/account/settings/profile.mobile.html',
        controller: 'ProfileController',
        controllerAs: 'vm',
        authenticate: true
      });
  })
  .run(function($rootScope) {
    $rootScope.$on('$stateChangeStart', function(event, next, nextParams, current) {
      if (next.name === 'logout' && current && current.name && !current.authenticate) {
        next.referrer = current.name;
      }
    });
  });
