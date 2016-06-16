'use strict';

angular.module('billynApp.auth', [
  'billynApp.constants',
  'billynApp.util',
  'ngCookies',
  'ui.router'
])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
