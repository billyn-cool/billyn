'use strict';

(function () {

    function VoucherService($resource, User, $q, $rootScope, Util, $http) {
        var safeCb = Util.safeCb;
        var resVoucher = $resource('/api/vouchers/:id/:controller', {
            id: '@_id'
        }, {
                bulkCreate: {
                    method: 'POST',
                    isArray: true,
                    params: {
                        id: 'bulk'
                    }
                }
            });
        var resVoucherType = $resource('/api/vouchers/types/:id/:controller', {
            id: '@_id'
        }, {
                update: {
                    method: 'PUT'
                },
                getTypes: {
                    method: 'GET',
                    isArray: true
                },
                addTypes: {
                    method: 'POST',
                    id: 'batch',
                    isArray: true
                },
                addType: {
                    method: 'POST',
                    isArray: true
                },

            });

        var currentApp = {};

        var service = {};

        service.setCurrent = function (app) {
            return currentApp = app;
        }

        service.current = function (callback) {

            return currentApp;
        }

        /* first work on voucher table */

        service.find = function (voucherData) {

            if (!isNaN(nameOrId) && nameOrId > 0) {
                return resApp.get({
                    id: nameOrId
                });
            }

            //otherwise find by name
            var appName = nameOrId;
            //add app config
            return $http.get('/components/blyn/core/app/config.json')
                .then(function (res) {
                    var appConfig = res.data;
                    console.log('appConfig', appConfig);

                    if (appConfig['apps'][appName]) {

                        var appData = appConfig['apps'][appName];
                        appData.name = appName;

                        //remove nuts element
                        if (appData.nuts) {
                            var nuts = appData.nuts;
                            delete appData.nuts;
                        }
                        if (appData.cores) {
                            var cores = appData.cores;
                            delete appData.cores;
                        }

                        return resApp.findOrCreate(appData).$promise.then(function (res) {

                            return res.data;

                            //if (res.created === true && nuts.length > 0) {
                            //return this.addNuts(nuts);
                            //}

                            //otherwise, return error
                            //return $q.reject('fail to add nuts into app!');
                        });
                    }

                    //otherwise, return error
                    return $q.reject('fail to get app!');
                },
                function (err) {
                    console.log(err);
                }
                );
        }

        service.findAll = function (voucherData) {
            return resVoucher.query({ spaceId: $rootScope.current.space._id }).$promise;
            //  return resVoucher.query(voucherData).$promise;
        }

        service.create = function (voucherData) {
            if (voucherData.spaceId) {

            }
        }

        service.update = function (voucherData) { }

        service.delete = function (voucherData) { }

        /* below working on voucherUser voucher */

        service.findVoucherUser = function (voucherUserData) { }

        service.findAllVoucherUser = function (voucherUserData) { }

        service.createVoucherUser = function (voucherUserData) { }

        service.updateVoucherUser = function (voucherUserData) { }

        service.deleteVoucherUser = function (voucherUserData) { }

        /* below working on price table */

        service.findPrice = function (priceData) { }

        service.findAllPrice = function (priceData) { }

        service.addPrice = function (priceData) { }

        service.deletePrice = function (priceData) { }

        /* below working on type table */

        service.getType = function (typeData) {

            if (angular.isNumber(typeData)) {
                return resVoucherType.get({
                    id: typeData
                }).$promise;
            }

            if (angular.isString(typeData)) {
                typeData = {
                    name: typeData
                }
            }

            if (angular.isObject(typeData)) {

                if (!typeData.hasOwnProperty('spaceId')) {
                    typeData.spaceId = $rootScope.current.space._id;
                }

                //save type will call findOrCreate
                return resVoucherType.get(typeData).$promise;
            }
        }

        service.getTypes = function (typeData) {

            return resVoucherType.getTypes({ spaceId: $rootScope.current.space._id }).$promise.then(function (types) {
                if (types == null || types.length === 0) {
                    return service.initTypes();
                } else {
                    return $q.when(types);
                }
            });
        }

        service.addType = function (typeData) {

            //var typeData = defaultTypes[typeName];
            typeData.spaceId = $rootScope.current.space._id;

            return resVoucherType.addType(typeData).$promise;

            /*
            var configPath;

            configPath = '/components/blyn/nuts/voucher/config.json';

            return $http.get(configPath).then(function(res) {
                var configData = res.data;
                var whereData = {};
                var defaultData = {};
                if (typeof configData === 'object') {
                    var defaultTypes = configData.defaultTypes;
                    var typeData = defaultTypes[typeName];
                    typeData.spaceId = $rootScope.current.space._id;
                    typeData.name = key(typeData);

                    return resVoucherType.addType(typeData).$promise;
                }
            }); */

            //otherwise, return error
            //return $q.reject('fail to add type for voucher!');
        }

        service.getInitList = function () {
            var configPath = '/components/blyn/nuts/voucher/config.json';

            //  return $http.get(configPath).$promise;

            return $http.get(configPath).then(function (res) {
                var configData = res.data;
                return configData.defaultVouchers;
            });

        }
        //typesData should be array
        //this function will execute findOrCreate for all typeData
        service.initVouchers = function (initList, spaceId) {

            var configPath;

            configPath = '/components/blyn/nuts/voucher/config.json';

            if (!spaceId) {
                spaceId = $rootScope.current.space._id;
            }

            return $http.get(configPath).then(function (res) {
                var configData = res.data;
                var whereData = {};
                var defaultData = {};
                var proms = [];
                var voucherDataList = [];
                if (typeof configData === 'object') {
                    var defaultVouchers = configData.defaultVouchers;

                    for (var key in defaultVouchers) {

                        if (initList && initList.length > 0 && initList.includes(key)) {
                            var voucherData = defaultVouchers[key];
                            voucherData.name = key;
                            voucherData.spaceId = spaceId;
                            voucherDataList.push(voucherData);

                            //   proms.push(service.save(voucherData));
                            //proms.push(resVoucher.save(voucherData));

                        }
                    }
                    return resVoucher.bulkCreate(voucherDataList).$promise.then(function () {
                        return resVoucher.query({ spaceId: $rootScope.current.space._id }).$promise;
                    });
                    //return $q.all(proms).then(function () {
                    //return resVoucher.query({ spaceId: $rootScope.current.space._id }).$promise;
                    //});
                }
            });

            //otherwise, return error
            //return $q.reject('fail to add type for voucher!'); 
        }

        service.deleteVoucher = function(voucherId){
             var res = $resource('/api/vouchers/:id');
             res.delete({id:voucherId});
        }
        
        service.deleteType = function (typeData) { }

        /* below working on voucher permit table */

        service.getPermit = function (permitData) {


        }

        service.getPermits = function (permitData) { }

        service.addPermit = function (permitData) { }

        service.deletePermit = function (permitData) { }

        /* below working on attribute table */

        service.getAttribute = function (attributeData) { }

        service.getAttributes = function (attributeData) { }

        service.addAttribute = function (attributeData) { }

        service.deleteAttribute = function (attributeData) { }

        /* below working on VoucherTimeslot table */

        service.findTimeslot = function (timeslotData) { }

        service.findTimeslots = function (timeslotData) { }

        service.addTimeslot = function (timeslotData) { }

        service.deleteTimeslot = function (timeslotData) { }

        /* this function is called when init voucher nut */
        service.initVoucherTypes = function () {

        }

        return service;
    }


    angular.module('billynApp.nut')
        .factory('BVoucher', VoucherService);

})();
