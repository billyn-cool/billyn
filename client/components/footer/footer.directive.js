'use strict';

//使index.html中的footer指令无效
angular.module('billynApp')
  .directive('footer-old', function() {
    return {
      templateUrl: 'components/footer/footer.html',
      restrict: 'E',
      link: function(scope, element) {
        element.addClass('footer');
      }
    };
  });
