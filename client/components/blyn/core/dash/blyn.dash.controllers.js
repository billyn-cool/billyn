'use strict';

(function () {

    class ListMessageController {
        constructor($q, Auth, BSpace, BApp, BNut) {
            // Use the User $resource to fetch all users
            //this.users = User.query();

            var ctrl = this;
            this.recommends = [1, 2, 3, 4, 5];

            // todo 查询指定user下的spaces数据
            var user = Auth.getCurrentUser();
            this.BSpace = BSpace;
            //应该使用getUserSpaces这个函数去获取数据
            ctrl.BSpace.getUserSpaces(user._id).then(function (spaces) {
                ctrl.spaces = spaces;
                angular.forEach(spaces, function (space) {
                    $q.when(BApp.findAppsByUser(space._id)).then(function (apps) {
                        space.apps = [];
                        for (var key in apps) {
                            space.apps.push(apps[key]);
                        }
                    });
                    /*
                    angular.forEach(space.apps, function(app) {
                        $q.when(BNut.findNuts({ spaceId: space._id, appId: app._id })).then(function(nuts) {
                            app.nuts = nuts;
                        });
                    });*/
                });
            }, function (error) {
                console.log('error', error);
            });

            this.currentSpace = {
                _id: '', name: '', desc: ''
            };
        }

        exitSpace() {
            alert("exit space: " + this.currentSpace._id);
        }
    }

    class CreateSpaceController {

        constructor($state, BSpace) {

            //layoutService.breadcrumbs.push({state:'user.createSpace', text:'创建机构'});

            // 暂存依赖
            this.$state = $state;
            this.BSpace = BSpace;
            this.creating = false;

            this.space = {
                name: '', alias: '', type: 'normal'
            };
            // todo 获取 space type
            //this.spaceTypes = BSpace.getTypeSpaces();
            /*
            this.spaceTypes = [
                { id: '1', alias: '通用机构' },
                { id: '2', alias: '商用机构' },
                { id: '3', alias: '公共机构' },
                { id: '4', alias: '非盈利机构' }
            ];*/
            
            var that = this;
            BSpace.getConfig().then(function(config){
                that.spaceTypes = config.types;
            })
        }

        createSpace(form) {
            if (form.$valid) {
                this.creating = true;
                // 暂存this对象
                var ctrl = this;
                // 将space数据，写进数据库！
                this.BSpace.create(this.space).then(function (res) {
                    ctrl.$state.go('pc.dashboard', null, { reload: 'pc' });
                }, function (err) {
                    this.creating = false;
                    console.log('err:', err);
                });
            }
        }
    }

    class JoinSpaceController {
        join() {
            console.log(this.currentSpace);
            var user = this.Auth.getCurrentUser();
            var ctrl = this;
            this.BSpace.userJoin(ctrl.currentSpace._id, user._id).then(function (data) {
                // console.log("join space result: " + data);
                if (data.$resolved === true) {
                    ctrl.toaster.success("Join space success.");
                    var index = -1;
                    var keepGoing = true;
                    angular.forEach(ctrl.joinSpaces, function (space) {
                        if (keepGoing === true) {
                            if (space._id === ctrl.currentSpace._id) {
                                index = ctrl.joinSpaces.indexOf(space);
                                keepGoing = false;
                            }
                        }
                    });
                    if (index > 0)
                        ctrl.joinSpaces.splice(index, 1);

                    angular.element('#myModal').on('hidden.bs.modal', function () {
                        ctrl.$state.go('pc.joinSpace', null, { reload: true });
                    });
                }
                else
                    ctrl.toaster.error("Join space failed.");

            });
        }
        constructor(BSpace, $state, Auth, toaster) {
            console.log(BSpace);
            this.BSpace = BSpace;
            this.$state = $state;
            this.Auth = Auth;
            this.toaster = toaster;
            this.joinSpaces = {};
            var ctrl = this;


            this.BSpace.getAllSpaces().then(function (res) {
                var allSpaces = res; //get all the spaces                
                var user = Auth.getCurrentUser();

                //Get the spaces of this user
                //then remove them from all the spaces.       
                ctrl.BSpace.getUserSpaces(user._id).then(function (spaces) {
                    angular.forEach(spaces, function (space) {
                        //   console.log(space);
                        var keepGoing = true;
                        angular.forEach(allSpaces, function (aSpace) {
                            if (keepGoing) {

                                if (aSpace._id == space._id) {
                                    var index = allSpaces.indexOf(aSpace);
                                    allSpaces.splice(index, 1);
                                    keepGoing = false;
                                }
                            }
                        });
                    });
                });

                ctrl.joinSpaces = allSpaces;
            });


            //查询指定可加入的spaces数据
            //this.joinSpaces = [
            //  {spaceId:1, name: '加入机构1', desc: '测试数据-加入机构1'},
            //  {spaceId:2, name: '加入机构2', desc: '测试数据-加入机构2'}
            //];
            // 用于存储单个space
            this.currentSpace = {
                _id: '', name: '', desc: ''
            };

        }
    }

    angular.module('billynApp.core')
        .controller('ListMessageController', ListMessageController)
        .controller('CreateSpaceController', CreateSpaceController)
        .controller('JoinSpaceController', JoinSpaceController);

})();
