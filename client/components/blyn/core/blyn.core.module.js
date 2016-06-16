'use strict';

angular.module('billynApp.core', [
  'billynApp.auth',
  'billynApp.util',
  'ngCookies',
  'ui.router',
  'ngAnimate',
  'ui.bootstrap',
  'ncy-angular-breadcrumb'
]).run(function($rootScope) {
	$rootScope.breadcrumb = {};	// To save the breadcrumbs.
});
