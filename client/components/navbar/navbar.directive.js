'use strict';

angular.module('billynApp')
  .directive('navbar', () => ({
    templateUrl: 'components/navbar/view/navbar.html',
    restrict: 'E',
    controller: 'NavbarController',
    controllerAs: 'nav'
  }));
