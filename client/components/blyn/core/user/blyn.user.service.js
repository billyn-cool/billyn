'use strict';

(function() {

    function BUserService($resource, User, $q, Util) {
        var safeCb = Util.safeCb;
        var resUser = $resource('/api/apps/:id/:controller', {
            id: '@_id'
        }, {
                update: {
                    method: 'PUT'
                },
                joinSpace: {
                    method: 'POST',
                    params: {
                        controller: 'joinSpace'
                    }
                },
                addType: {
                    method: 'POST',
                    params: {
                        controller: 'addType'
                    }
                },
                findOrCreate: {
                    method: 'POST',
                    params: {
                        controller: 'findOrCreate'
                    }
                }
            });

        var currentUser = {};

        var service = {};

        service.setCurrent = function(user) {
            return currentUser = user;
        }

        service.current = function(callback) {
            if (arguments.length === 0) {
                return currentUser;
            }
            var value = (currentUser.hasOwnProperty('$promise')) ?
                currentUser.$promise : currentUser;
            return $q.when(value)
                .then(user => {
                    safeCb(callback)(user);
                    return user;
                }, () => {
                    safeCb(callback)({});
                    return {};
                })
        }

        return service;
    }

    angular.module('billynApp.core')
        .factory('BUser', BUserService);

})();

