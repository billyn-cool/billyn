'use strict';

(function () {

  class UserController {
    constructor() {

    }
  }

  class UserHomeController {
    constructor($stateParams, $q, BRole, BSpace) {
      this.BRole = BRole;
      this.BSpace = BSpace;
      this.spaceId = $stateParams.spaceId;
      this.spaceRoles = [];
      this.spaceUsers = [];

      var ctrl = this;


      ctrl.BSpace.getSpaceUsers(this.spaceId).then(function (data) {
        data.forEach(function (spaceUser) {
          var a = spaceUser.roles;
          spaceUser.roles = a.filter(function (role) {
            return role.spaceId == ctrl.spaceId;
          });
        });

        ctrl.spaceUsers = data.filter(function (spaceUser) {
          return spaceUser.roles.length > 0;
        });
      });


      //   var p1 = ctrl.BRole.getSpaceRoles(this.spaceId);
      //   var p2 = ctrl.BSpace.getSpaceUsers(this.spaceId);

      //   $q.all([p1, p2]).then(function (data) {
      //     ctrl.spaceRoles = data[0];
      //     ctrl.spaceUsers = data[1];

      //     data[1].forEach(function (spaceUser) {
      //       var a = spaceUser.roles;
      //       spaceUser.roles = a.filter(function (role) {
      //         return role.spaceId == ctrl.spaceId;
      //       });
      //     });

      //     ctrl.spaceUsers = data[1].filter(function (spaceUser) {
      //       return spaceUser.roles.length > 0;
      //     });
      //   });
      //---------------------------------------------------------------------------     
      // function getUserRoles(user) {
      //   var defer = $q.defer();

      //   ctrl.BRole.getUserRoleInSpace(user._id, ctrl.spaceId)
      //     .then(function (roles) {
      //       defer.resolve(roles);
      //     });

      //   return defer.promise;
      // }
      // //get roles in this space
      // var p1 = this.BRole.getSpaceRoles(this.spaceId);
      // var p2 = this.BSpace.getSpaceUsers(this.spaceId);


      // $q.all([p1, p2]).then(function (data) {
      //   ctrl.spaceRoles = data[0];
      //   ctrl.spaceUsers = data[1];

      //   return ctrl.spaceUsers.map(getUserRoles);
      // })
      //   .then(function (value) {
      //     return $q.all(value);
      //   })
      //   .then(function (data) {

      //     var a = data;
      //     var b = data
      //   });


      //get roles for each user
      // BRole.getUserRoleInSpace(1, 3).then(function(res){
      //    // alert("user roles: " + res[0].roleId);
      // });     
    }

  }

  class AssignRoleController {
    constructor($stateParams, BRole, toaster) {
      this.user = $stateParams.currentUser;
      this.spaceId = $stateParams.spaceId;
      this.BRole = BRole;
      this.spaceRoles = [];
      this.roles =[];
      this.toaster = toaster;
      var ctrl = this;
      

      ctrl.BRole.getSpaceRoles(ctrl.spaceId).then(function (data) {
        data.forEach(function (role) {
          var enabled = false;
          var index = ctrl.user.roles.findIndex(function (r) {
            return r._id == role._id;
          });

          if (index > -1)
            enabled = true;
          
          role.checked = enabled;
          ctrl.roles.push(role);
        });
      });    
    }
  
    save() {
      var toAdd = [];
      var toDel = [];
      var ctrl = this;    
    
      this.roles.forEach(function (role) {
        var index = ctrl.user.roles.findIndex(function (r) {
          return r._id == role._id;
        });
        if (role.checked) {
          if (index == -1) {//add if not find in user roles bu checked
            toAdd.push(role);
          }
        }
        else {
          if (index > -1) { //delete if find in user roles but unchecked
            toDel.push(role);
          }
        }
      });
      
      if(toAdd.length > 0){
        var toAddRoles = [];
        toAdd.forEach(function(role){
          var roleData = {};
          roleData.userId = ctrl.user._id;
          roleData.roleId = role._id;
           
          toAddRoles.push(roleData);      
        });
        ctrl.BRole.addUserRoleBatch(toAddRoles).then(function(res){
           if(res.$resolved){
               res.forEach(function(r){
                 var role = toAdd.find(function(tr){
                    return tr._id == r.roleId;                
                 });
                  ctrl.toaster.success("Success add "+ role.name + " for user "+ ctrl.user.loginId);
               });
               
               
           }
        });
     }
      if (toDel.length > 0) {
        // toDelRoles = toDel.map(function (role) {
        //   var roleData = {};
        //   roleData.userId = ctrl.user._id;
        //   roleData.spaceId = ctrl.spaceId;
        //   roleData.roleId = role._id;

        //   return ctrl.BRole.deleteUserRole(roleData);
        // });
        // ctrl.$q.all(toDelRoles).then(function (res) {
        //   var a = res;
        //   var b = a.length;
        // });
      }
    }
  }

  class DeleteRoleController {
    constructor($stateParams) {
      this.user = $stateParams.currentUser;
    }
  }

  angular.module('billynApp.core')
    .controller('UserController', UserController)
    .controller('UserHomeController', UserHomeController)
    .controller('DeleteRoleController', DeleteRoleController)
    .controller('AssignRoleController', AssignRoleController);
})();
