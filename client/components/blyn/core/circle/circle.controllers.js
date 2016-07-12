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

            /*
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
            */
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
    /*
    class JoinCircleController {
        constructor($rootScope, BCircle, $state) {
            var ctrl = this;
            ctrl.BCircle = BCircle;
            ctrl.$state = $state;
            BCircle.findCirclesForJoin().then(function(circles){
                ctrl.joinableCircles = circles;
                BCircle.findJoinedCircles().then(function(jCircles){
                    ctrl.joinedCircles = jCircles;
                })
            });          
        }
        
        joinCircle(circle){
            var ctrl = this;
            ctrl.BCircle.joinCircle(circle).then(function(theCircle){
                ctrl.joinableCircles.forEach(function(circle,index){
                    if(circle._id === theCircle._id){
                        //if joined, move the joined circle from joinableCircles
                        ctrl.joinableCircles.slice(index,1);
                        ctrl.joinedCircles.push(theCircle);
                    }
                });
                
            })
        }
    }*/

    class ManageCircleController {
        constructor($rootScope, BCircle, $state, BNut, $q) {
            var ctrl = this;
            ctrl.BNut = BNut;
            BCircle.findUserLocalCircles({ spaceId: $rootScope.current.space._id }).then(function (lCircles) {
                ctrl.localCircles = lCircles;
            })

            ctrl.allowManageCollab = false;
            ctrl.allowCreateCollab = false;

            ctrl.BNut.userHasPermit('Collab', 'manageCollab').then(function (result) {
                ctrl.allowManageCollab = result;
            })

            ctrl.BNut.userHasPermit('Collab', 'adminCollab').then(function (result) {
                ctrl.allowCreateCollab = result;
            });

        }
    }

    class ManageCircleCollabController {
        constructor($rootScope, BCircle, $state, BNut, $q) {
            var ctrl = this;
            ctrl.BNut = BNut;
            

        }
    }

    class ManageCircleSpacesController {
        constructor($rootScope, BCircle, $state, $stateParams, BCollab) {
            var ctrl = this;
            ctrl.$rootScope = $rootScope;
            ctrl.$state = $state;
            ctrl.BCircle = BCircle;
            ctrl.circle = $rootScope.current.circle;
            ctrl.current = {};
            var space = $rootScope.current.space;
            
            BCollab.findAll({
                spaceId: space._id
            }).then(function(collabs){
                space.collabs = collabs;
                ctrl.current.space = space;
                ctrl.current.space.showManageCollab = false;
            })
            /*
            if ($stateParams.circleId) {
                BCircle.find($stateParams.circleId).then(function (circle) {
                    ctrl.circle = circle;
                })
            }*/
        }

        toggleShowList(showId){
            var ctrl = this;
            ctrl.showList = ctrl.showList || {};
            ctrl.showList[showId] ? ctrl.showList[showId] = ! ctrl.showList[showId]: ctrl.showList[showId] = true;
            var tempShowId = ctrl.showList[showId];
            //first toggle all showList to false
            for(var key in ctrl.showList){
                ctrl.showList[key] = false;
            }
            //change current
            ctrl.showList[showId] = tempShowId;
            
            ctrl.showList;
        }

        approveJoinCircle(space) {
            var ctrl = this;
            var circle = ctrl.$rootScope.current.circle;
            ctrl.BCircle.addCircleSpace(space, circle, "approved").then(function (circleSpace) {
                space.CircleSpace.joinStatus = circleSpace.joinStatus;
            })
        }

        rejectJoinCircle(space) {
            var ctrl = this;
            var circle = ctrl.$rootScope.current.circle;
            ctrl.BCircle.addCircleSpace(space, circle, "rejected").then(function (circleSpace) {
                space.CircleSpace.joinStatus = circleSpace.joinStatus;
            })
        }

        approveShareCollab(collab, circle) {
            var ctrl = this;
            circle = circle || ctrl.circle;
            ctrl.BCircle.addCollab(collab, circle, 'approved').then(function (circleCollab) {
                collab.CircleCollab = circleCollab;
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
                    var path = 'pc.space.app.circle.adminCircle'
                    //console.log('path:',path);
                    that.$state.go(path);
                }, function (err) {
                    that.creating = false;
                    console.log('err:', err);
                });
            }
        }
    }

    class CircleMemberChiefController {
        constructor($rootScope, BCircle, $state) {
            var ctrl = this;
            ctrl.$state = $state;
            ctrl.BCircle = BCircle;
            ctrl.$rootScope = $rootScope;
            BCircle.findCirclesForJoin().then(function (circles) {
                ctrl.joinableCircles = circles;
                BCircle.findJoinedCircles().then(function (jCircles) {
                    ctrl.joinedCircles = jCircles;
                })
            });
        }

        joinCircle(circle, space) {
            var ctrl = this;
            var space = space || ctrl.$rootScope.current.space;
            ctrl.BCircle.addCircleSpace(space, circle).then(function (theCircle) {
                ctrl.joinableCircles.forEach(function (circle, index) {
                    if (circle._id === theCircle._id) {
                        //if joined, move the joined circle from joinableCircles
                        ctrl.joinableCircles.slice(index, 1);
                        ctrl.joinedCircles.push(theCircle);
                    }
                });

            })
        }
    }

    class ShareCollabController {
        constructor($rootScope, BCircle, $state, BCollab, $q) {
            var ctrl = this;
            ctrl.$state = $state;
            ctrl.BCircle = BCircle;
            ctrl.space = $rootScope.current.space;
            ctrl.circle = $rootScope.current.circle;

            BCollab.findSpaceCollabs().then(function (collabs) {
                ctrl.collabs = collabs;
                collabs.forEach(function (oCollab, index) {
                    ctrl.circle.collabs.forEach(function (o) {
                        if (o._id === oCollab._id) {
                            ctrl.collabs[index] = o;
                        }
                    })
                })
            });

        }

        applyShareCollab(collab, circle) {
            var ctrl = this;
            circle = circle || ctrl.circle;
            ctrl.BCircle.addCollab(collab, circle).then(function (circleCollab) {
                collab.CircleCollab = circleCollab;
            })
        }

        exitShareCollab(collab, circle) {
            var ctrl = this;
            circle = circle || ctrl.circle;
            ctrl.BCircle.addCollab(collab, circle, 'exit').then(function (circleCollab) {
                collab.CircleCollab = circleCollab;
            })
        }
    }

    class ListCircleCollabController {
        constructor($rootScope, BCircle, $state, BCollab, $q) {
            var ctrl = this;
            ctrl.$state = $state;
            ctrl.BCircle = BCircle;
            ctrl.BCollab = BCollab;
            ctrl.space = $rootScope.current.space;
            ctrl.circle = $rootScope.current.circle;
        }

        getCollabRolesForManage(collab){
            var ctrl = this;

            var roles = ctrl.space.roles.slice();
            var collobRoles = collab.childRoles;

            roles.forEach(function(r,index){
                collobRoles.forEach(function(cr){
                    if(r._id === cr._id){
                        roles[index] = cr;
                    }
                })
            })

            return roles;
        }

        addCollabRole(collab, role, joinStatus) {
            var ctrl = this;
            var joinStatus = joinStatus || 'joined';
            ctrl.BCollab.addCollabRole({
                collabId: collab._id,
                childRoleId: role._id,
                joinStatus: joinStatus
            }).then(function(collabRole){
                role.CollabRole = collabRole;
            })
        }

        toggleShowSlice(showId){
            var ctrl = this;
            ctrl.showSlice = ctrl.showSlice || {};
            ctrl.showSlice[showId] ? ctrl.showSlice[showId] = ! ctrl.showSlice[showId]: ctrl.showSlice[showId] = true;
            var tempShowId = ctrl.showSlice[showId];
            //first toggle all showList to false
            for(var key in ctrl.showSlice){
                ctrl.showSlice[key] = false;
            }
            //change current
            ctrl.showSlice[showId] = tempShowId;
            
            ctrl.showSlice;
        }
    }

    class JoinCircleCollabController {
        constructor($rootScope, BCircle, $state, $stateParams, BCollab, BSpace, $q) {
            var ctrl = this;
            this.$state = $state;
            this.creating = false;
            this.BCollab = BCollab;
            ctrl.joinData = {};

            if ($stateParams.collabId) {
                BCollab.find($stateParams.collabId).then(function (collab) {
                    ctrl.joinData.collab = collab;
                });
            }

            if ($stateParams.joinedSpaceId) {
                BSpace.find($stateParams.joinedSpaceId).then(function (space) {
                    ctrl.joinData.space = space;
                });
            }

            ctrl.joinData.roles = $rootScope.current.space.roles;
        }

        joinCollab(form) {
            var that = this;
            var ctrl = this;
            if (form.$valid) {
                this.creating = true;
                // 暂存this对象


                var collabRoleData = [];

                ctrl.joinData.roles.forEach(function (r) {
                    if (r.selected) {
                        var collabRole = {};
                        collabRole.collabId = ctrl.joinData.collab._id;
                        collabRole.childRoleId = r._id;
                        collabRoleData.push(collabRole);
                    }
                })
                var inputRole = this.inputRole || null;

                if (angular.isObject(inputRole)) {
                    var collabRole = {};
                    collabRole.childRole = inputRole;
                    collabRole.spaceId = ctrl.joinData.space._id;
                    collabRole.collabId = ctrl.joinData.collab._id;
                    collabRoleData.push(collabRole);
                }

                this.BCollab.bulkAddCollabRole(collabRoleData).then(function (res) {
                    ctrl.$state.go('pc.space.app.circle.circleMemberChief.listCollab.home');
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
        .controller('ManageCircleSpacesController', ManageCircleSpacesController)
        .controller('ManageCircleController', ManageCircleController)
        .controller('CircleMemberChiefController', CircleMemberChiefController)
        .controller('ShareCollabController', ShareCollabController)
        .controller('ListCircleCollabController', ListCircleCollabController)
        .controller('JoinCircleCollabController', JoinCircleCollabController)
        .controller('CreateCircleController', CreateCircleController);
})();
