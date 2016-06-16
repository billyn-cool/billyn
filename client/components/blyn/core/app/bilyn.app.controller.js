'use strict';

(function () {

  class AppController {
    constructor() {
      
    }
  }

  class AppHomeController {
    constructor($rootScope, BNut) {
      var ctrl = this;
      this.space = $rootScope.current.space;
      this.app = $rootScope.current.app;
      this.dotToDashInString = function(str){
        return str.replace(/\./g,'_');
      }
      BNut.findUserNuts(this.app._id).then(function(userNuts){
        ctrl.app.userNuts = userNuts;
      });
      //this.app.permitNuts = {};
      /*
      BNut.findAllUserPermitNut(this.app._id).then(function(permitNuts) {
        angular.forEach(permitNuts, function(permitNut) {
          ctrl.app.permitNuts[permitNut.nut._id] = permitNut;
        });
      });*/
    }
  }
  
  class NutPermitController {
    constructor($rootScope,BSpace,BNut,$q, $stateParams) {
      
      var ctrl = this;
      this.space = $rootScope.current.space;
      this.app = $rootScope.current.app;
      this.nutId = $stateParams.nutId;
      ctrl.list = [];
      BSpace.findRoles(this.space._id).then(function(roles){
        ctrl.space.roles = roles;
        return $q.when(roles);
      }).then(function(){
        return BNut.findAllPermitRole({
          nutId: ctrl.nutId
        }).then(function(rows){
          ctrl.nut = rows[0].nut;
          ctrl.nut.permitRoles = rows;
          return BNut.getNutPermits(ctrl.nutId);
        }).then(function(permits){               
          ctrl.space.roles.forEach(function(role){     
            var oPermits = Object.assign({},permits);       
            ctrl.nut.permitRoles.forEach(function(pr){
              if(pr.role._id === role._id){
                //change permit to permit object
                pr.permit.checked = true;
                pr.permit.permitRole = pr;
                oPermits[pr.permit.name]=pr.permit;
              }
            });   
            var thePermits = [];
            for(var key in oPermits){
              var p = Object.assign({},oPermits[key]);
              if(!p._id){
                p.targetRole = role.name;
                p.name = key;
                p.checked = false;
              } 
              thePermits.push(p);        
            }       
                                     
            ctrl.list.push({
              role: role,
              permits: thePermits
            });
          });
        });
      }); 
      
      this.changePermit = function(permitData,roleData){
        if(permitData._id && permitData._id > 0 && permitData.checked === false){
          var id = permitData.permitRole._id;
          delete permitData._id;
          BNut.deleteNutPermitRole(permitData.permitRole._id);
        }
        
        if(!permitData._id && permitData.checked){
          BNut.addNutPermitRole(ctrl.nut,permitData,roleData).then(function(res){
            permitData = res.permit;
          })
        }
      }
    }

    // 通过角色获得label的样式.
    getLabelClassByRole(role) {
      var rolesArr = role.split('.');
      if (typeof rolesArr[0] == 'undefined') {
        return 'label-info';
      }
      switch (rolesArr[0]) {
        case 'admin': return 'label-danger';
        case 'member': return 'label-warning';
        case 'customer': return 'label-success';
        default : return 'label-info';
      }
    }
  }
  
  class AppStoreController {
    constructor($state) {
      // Init the switch button group.
      if(/^pc\.space\.appStore\.add/.test($state.current.name)) {
        this.tab = 'add';
      } else {
        this.tab = 'delete';
      }
    }
  }

  angular.module('billynApp.core')
    .controller('AppController', AppController)
    .controller('AppHomeController', AppHomeController)
    .controller('AppStoreController', AppStoreController)
    .controller('NutPermitController', NutPermitController);

})();
