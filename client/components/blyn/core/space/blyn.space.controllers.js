'use strict';

(function () {

  class SpaceController {
    constructor() {

    }
  }

  /*class SpaceHomeController {
    constructor($rootScope, BApp) {
      var ctrl = this;
      this.space = $rootScope.current.space;
      BApp.findAppsByUser(this.space._id).then(function (apps) {
          ctrl.space.apps = [];
          for (var key in apps) {
              ctrl.space.apps.push(apps[key]);
          }
      });
    }
  }*/

  class SpaceHomeController {
    constructor($state, $stateParams, $rootScope, BNut) {
      var ctrl = this;
      ctrl.space = $rootScope.current.space;
      /*
      $rootScope.current.nut.permits = [];
      BNut.findAllUserPermitNut($rootScope.current.app._id).then(function (permitNuts) {
        for (var i = 0; i < permitNuts.length; i++) {
          if (permitNuts[i].nut && permitNuts[i].nut.name == 'space') {
            $rootScope.current.nut.permits.push(permitNuts[i].permit);
            ctrl.nut = $rootScope.current.nut;
          }
        }
      });*/
    }
  }

  class AppStoreController {
    constructor($state) {
      // Init the switch button group.
      if (/^pc\.space\.appStore\.add/.test($state.current.name)) {
        this.tab = 'add';
      } else {
        this.tab = 'delete';
      }
    }
  }

  class AddAppsController {
    constructor(BApp) {
      var self = this;
      BApp.findAppsInStore().then(function (apps) {
        //console.log('apps', apps);
        self.apps = apps;
      }, function (err) {
        console.log('err', err);
      });
    }
  }

  class DeleteAppController {
    constructor(BSpace, BApp, $q) {
      var self = this;
      $q.when(BApp.findAppsInSpace()).then(function (apps) {
        self.apps = apps ? apps : [];
      }, function (err) {
        console.log('err', err);
      });
    }
  }

  angular.module('billynApp.core')
    .controller('SpaceController', SpaceController)
    .controller('SpaceHomeController', SpaceHomeController)
    .controller('AppStoreController', AppStoreController)
    .controller('AddAppsController', AddAppsController)
    .controller('DeleteAppController', DeleteAppController);

})();
