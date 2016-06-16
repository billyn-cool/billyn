'use strict';

(function () {

    class CircleController {
        constructor($state, $stateParams, $rootScope, BNut) {
            var test = 'test';
        }
    }

    class CircleHomeController {
        constructor($state, $stateParams, $rootScope, BNut, BCircle) {
            var ctrl = this;
            this.nut = $rootScope.current.nut;

            this.createCircle = function (formData) {
                BCircle.addCircle(formData);
            }

            this.isLocalCircle = function (circle) {
                return angular.isObject(circle.userNutPermits);
            }

            BCircle.findUserJoinedCircles({ spaceId: $rootScope.current.space._id }).then(function (circles) {
                ctrl.joinedCircles = circles;
                ctrl.circles = [];
                if (angular.isArray(circles)) {
                    ctrl.circles = circles;
                }

                BCircle.findUserLocalCircles({ spaceId: $rootScope.current.space._id }).then(function (lCircles) {
                    ctrl.localCircles = lCircles;
                    lCircles.forEach(function (c) {
                        ctrl.circles.push(c);
                    })
                })
            });
        }
    }

    class AdminCircleController {
        constructor($rootScope, BCircle, $state) {
            var ctrl = this;
            BCircle.findUserLocalCircles({ spaceId: $rootScope.current.space._id }).then(function (lCircles) {
                ctrl.localCircles = lCircles;
            })
        }
    }
    
    class JoinCircleController {
        constructor($rootScope, BCircle, $state) {
            var ctrl = this;
            BCircle.findCirclesForJoin().then(function(circles){
                ctrl.joinableCircles = circles;
                BCircle.findJoinedCircles().then(function(jCircles){
                    ctrl.joinedCircles = jCircles;
                })
            });          
        }
        
        joinCircle(circle){
            var that = this;
            BCircle.joinCircle(circle).then(function(theCircle){
                ctrl.joinableCircles.forEach(function(circle,index){
                    if(circle._id === theCircle._id){
                        //if joined, move the joined circle from joinableCircles
                        ctrl.joinableCircles.slice(index,1);
                        ctrl.joinedCircles.push(theCircle);
                    }
                })
            })
        }
    }
    
    class ManageCircleController {
        constructor($rootScope, BCircle, $state) {
            var ctrl = this;
            BCircle.findUserLocalCircles({ spaceId: $rootScope.current.space._id }).then(function (lCircles) {
                ctrl.localCircles = lCircles;
            })
        }
    }

    class CreateCircleController {

        constructor($state, BCircle, $http, $rootScope) {

            var that = this;

            //layoutService.breadcrumbs.push({state:'user.createSpace', text:'创建机构'});

            // 暂存依赖
            this.$state = $state;
            this.BCircle = BCircle;
            this.creating = false;
            this.current = $rootScope.current;

            this.circle = {
                name: '', alias: '', description: '', type: 'normal'
            };

            $http.get("/components/blyn/core/circle/config.json").then(function (result) {
                //set default type
                that.circleTypes = result.data.circleTypes;
            })
        }

        createCircle(form) {
            var that = this;
            if (form.$valid) {
                this.creating = true;
                // 暂存this对象
                var ctrl = this;
                // 将circle据，写进数据库！
                //get all circle data from config
                this.circle.type = this.circleTypes[this.circle.type];
                this.circle.spaceId = this.current.space._id;
                this.BCircle.createCircle(this.circle).then(function (res) {
                    var path = 'pc.space.app.circle'
                    //console.log('path:',path);
                    ctrl.$state.go(path);
                }, function (err) {
                    that.creating = false;
                    console.log('err:', err);
                });
            }
        }
    }

    /*

    class AdminCollabController {
        constructor($rootScope, BCircle) {
            var ctrl = this;
            BCircle.findAllCollab({ spaceId: $rootScope.current.space._id }).then(function (collabs) {
                collabs.forEach(function (collab) {
                    var collabRoles = collab.collabRoles;
                    var parentRoles = [];
                    var childRoles = [];
                    collabRoles.forEach(function (cr) {
                        if (cr.roleType === 'parent') {
                            parentRoles.push(cr.role.name);
                        }
                        if (cr.roleType === 'child') {
                            childRoles.push(cr.role.name);
                        }
                    })
                    collab.parentRoles = parentRoles;
                    collab.childRoles = childRoles;
                });
                ctrl.collabs = collabs;
            })
        }
    }

    class CreateCollabController {

        constructor($state, BCircle, $http, $rootScope, BNut) {

            var that = this;

            //layoutService.breadcrumbs.push({state:'user.createSpace', text:'创建机构'});

            // 暂存依赖
            this.$state = $state;
            this.BCircle = BCircle;
            this.creating = false;
            this.current = $rootScope.current;

            this.collab = {
                name: '', alias: '', description: '', type: 'normal'
            };

            $http.get("/components/blyn/core/circle/config.json").then(function (result) {
                //set default type
                that.collabTypes = result.data.collabTypes;
            });

            this.roleNutPermits = {};
            BNut.findAllPermitRole({ spaceId: this.current.space._id }).then(function (results) {
                results.forEach(function (o) {
                    if (!that.roleNutPermits[o.role._id]) {
                        that.roleNutPermits[o.role._id] = [];
                    }
                    that.roleNutPermits[o.role._id].push(o);
                })
            })
        }

        createCollab(form) {
            var that = this;
            if (form.$valid) {
                this.creating = true;
                // 暂存this对象
                var ctrl = this;
                // 将circle据，写进数据库！
                //get all circle data from config
                this.collab.type = this.collabTypes[this.collab.type];
                this.collab.spaceId = that.current.space._id;
                var parentRoles = [];
                this.current.space.roles.forEach(function (role) {
                    if (role.selected) {
                        parentRoles.push(role.name);
                    }
                });
                this.collab.parentRoles = parentRoles;
                this.BCircle.createCollab(this.collab).then(function (res) {
                    ctrl.$state.go('pc.space.app.circle.adminCollab');
                }, function (err) {
                    that.creating = false;
                    console.log('err:', err);
                });
            }
        }

        showNutPermitList(nutPermitRoles) {
            var ret = '';
            if (nutPermitRoles) {
                nutPermitRoles.forEach(function (o) {
                    ret += o.nut.name + "/" + o.permit.name + ',';
                })
                //remove last character
                ret = ret.slice(0, -1);
            }
            return ret;
        }
    }
    */

    angular.module('billynApp.core')
        .controller('CircleController', CircleController)
        .controller('CircleHomeController', CircleHomeController)
        .controller('AdminCircleController', AdminCircleController)
        .controller('JoinCircleController', JoinCircleController)
        .controller('ManageCircleController', ManageCircleController)
        .controller('CreateCircleController', CreateCircleController);
})();
