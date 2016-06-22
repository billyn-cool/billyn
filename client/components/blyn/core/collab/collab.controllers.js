'use strict';

(function () {

    class CollabController {
        constructor($state, $stateParams, $rootScope, BNut) {
            var test = 'test';
        }
    }

    class CollabHomeController {
        constructor($state, $stateParams, $rootScope, BNut, BCollab) {
            var ctrl = this;
            this.nut = $rootScope.current.nut;

            this.isLocalCollab = function (collab) {
                return angular.isObject(collab.userNutPermits);
            }

        }
    }

    class AdminCollabController {
        constructor($rootScope, BCollab) {
            var ctrl = this;

            BCollab.findAll({
                spaceId: $rootScope.current.space._id
            }).then(function (collabs) {
                ctrl.collabs = collabs;
            })
        }
    }

    class CreateCollabController {

        constructor($state, BCollab, $http, $rootScope) {

            var that = this;

            //layoutService.breadcrumbs.push({state:'user.createSpace', text:'创建机构'});

            // 暂存依赖
            this.$state = $state;
            this.BCollab = BCollab;
            this.creating = false;
            this.current = $rootScope.current;
            this.roles = $rootScope.current.space.roles.slice();

            this.collab = {
                name: '', alias: '', description: '', type: 'normal'
            };

            $http.get("/components/blyn/core/collab/config.json").then(function (result) {
                //set default type
                that.collabTypes = result.data.types;
            })

        }

        createCollab(form) {
            var that = this;
            if (form.$valid) {
                this.creating = true;
                // 暂存this对象
                var ctrl = this;
                // 将collab据，写进数据库！
                //get all collab data from config
                this.collab.type = this.collabTypes[this.collab.type];
                this.collab.spaceId = this.current.space._id;
                var parentRoles = [];
                this.roles.forEach(function (r) {
                    if (r.selected) {
                        parentRoles.push({
                            parentRoleId: r._id
                        })
                    }
                })
                var inputRole = this.inputRole || null;

                if (angular.isObject(inputRole)) {
                    parentRoles.push(inputRole);
                }
                if (parentRoles.length > 0) {
                    this.collab.parentRoles = parentRoles;
                }
                this.BCollab.createCollab(this.collab).then(function (res) {
                    that.$state.go('pc.space.app.collab.adminCollab');
                }, function (err) {
                    that.creating = false;
                    console.log('err:', err);
                });
            }
        }
    }

    class ParentCollabController {
        constructor($state, $stateParams, $rootScope, BCollab) {
            var ctrl = this;
            ctrl.current = $rootScope.current;

            BCollab.findAllJoinableSpace().then(function (spaces) {
                ctrl.joinableSpaces = spaces;
            })
            
            BCollab.findAllJoinedSpace().then(function (spaces) {
                ctrl.joinedSpaces = spaces;
            })
            
            this.isJoinedCollab = function(collab,space){
                var joinedCollabs = space.joinedCollabs;
                var isJoined = false;
                joinedCollabs.forEach(function(jc){
                    if(jc._id === collab._id){
                        isJoined = true;
                    }
                })
                return isJoined;
            }
        }
    }
    
    class JoinCollabController {
        constructor($state, $stateParams, $rootScope, BCollab) {
            var ctrl = this;
            this.$state = $state;
            ctrl.current = $rootScope.current;
            this.collabRole = {};
            this.roles = this.current.space.roles;
            this.BCollab = BCollab;

            if ($stateParams.collabId) {
                BCollab.find($stateParams.collabId).then(function (collab) {
                    $rootScope.current.collab = collab;
                    ctrl.current.collab = collab;
                })
            }
        }

        joinCollab(form) {
            var that = this;
            if (form.$valid) {
                this.creating = true;
                // 暂存this对象
                var ctrl = this;
                
                var collabRoleData =[];
                
                this.roles.forEach(function (r) {
                    if (r.selected) {
                        var collabRole = {};
                        collabRole.collabId = that.current.collab._id;
                        collabRole.childRoleId = r._id;
                        collabRoleData.push(collabRole);
                    }
                })
                var inputRole = this.inputRole || null;

                if (angular.isObject(inputRole)) {
                    var collabRole = {};
                    collabRole.childRole = inputRole;
                    collabRole.spaceId = that.current.space._id;
                    collabRole.collabId = that.current.collab._id;
                    collabRoleData.push(collabRole);
                }

                this.BCollab.bulkAddCollabRole(collabRoleData).then(function (res) {
                    ctrl.$state.go('pc.space.app.collab.parentCollabs');
                }, function (err) {
                    that.creating = false;
                    console.log('err:', err);
                });
            }
        }
    }

    class ChildCollabController {
        constructor($state, $stateParams, $rootScope, BNut) {
            var test = 'test';
        }
    }
    
    class CollabNutController {
        constructor($state, $stateParams, $rootScope, BCollab) {
            var ctrl = this;
            BCollab.findAllUserCollabNut().then(function(spaces){
                ctrl.spaces = spaces;
            })
        }
    }

    angular.module('billynApp.core')
        .controller('CollabController', CollabController)
        .controller('CollabHomeController', CollabHomeController)
        .controller('AdminCollabController', AdminCollabController)
        .controller('CreateCollabController', CreateCollabController)
        .controller('ParentCollabController', ParentCollabController)
        .controller('JoinCollabController', JoinCollabController)
        .controller('CollabNutController', CollabNutController)
        .controller('ChildCollabController', ChildCollabController);
})();
