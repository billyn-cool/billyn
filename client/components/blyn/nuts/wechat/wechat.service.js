'use strict';

(function () {

  function WeChatService($resource, Util) {
    var safeCb = Util.safeCb;
    var resWeChat = $resource('/api/weChats/:id/:controller', {
      id: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
    var service = {};

    service.getUserWeChats = function (spaceId, callback) {
      //get: /api/weChats/space?spaceId=xx
      //return weChats
      return resWeChat.query({
          id: 'space',
          spaceId: spaceId
        },
        function (data) {
          return safeCb(callback)(null, data);
        },
        function (err) {
          return safeCb(callback)(err);
        }).$promise;
    };

    return service;
  }

  angular.module('billynApp.core')
    .factory('WeChatService', WeChatService);

})();
