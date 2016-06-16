'use strict';

(function () {

  class VoucherController {
    constructor($state, permitNut) {
      // Init the switch button group.
      // if(/^mobile\.voucher\.valid/.test($state.current.name)) {
      //   this.tab = 'valid';
      // } else {
      //   this.tab = 'invalid';
      // }

      // // Get user role in current nut.
      // var role = permitNut.role.name;
      // if ($state.is('pc.space.app.voucher') || !$state.includes('pc.space.app.voucher.' + role)) {
      //   $state.go('pc.space.app.voucher.' + role);
      // }
    }
  }

  class VoucherHomeController {
    constructor($state, $stateParams, $rootScope, BNut) {
      var ctrl = this;
      $rootScope.current.nut.permits = [];
      BNut.findAllUserPermitNut($rootScope.current.app._id).then(function (permitNuts) {
        for (var i = 0; i < permitNuts.length; i++) {
          if (permitNuts[i].nut && permitNuts[i].nut.name == 'voucher') {
            $rootScope.current.nut.permits.push(permitNuts[i].permit);
            ctrl.nut = $rootScope.current.nut;
          }
        }
      });

      this.getStateByPermit = function (permitName) {
        return 'pc.space.app.voucher.' + permitName.replace(/\./g, "_");
      }
    }
  }
  class AdminVoucherController {
    constructor() {

    }
  }
  class AdminVoucherHomeController {
    constructor($state, $stateParams, $rootScope, BVoucher, BNut) {
      this.BVoucher = BVoucher; 
      this.defaultVouchers = [];
      this.isInit = false;
      var ctrl = this;
      this.allVouchers = [];
      this.$state = $state;
 
      this.BVoucher.findAll($stateParams.spaceId).then(function (data) {
        if (data.length > 0) {         
          ctrl.allVouchers = data;
          ctrl.isInit = true;
        }
        else {
          BVoucher.getInitList().then(function (data) {
            var vouchers = data;
            for (var key in vouchers) {
              var voucher = vouchers[key];
              voucher.name = key;
              voucher.checked = false;
              ctrl.defaultVouchers.push(voucher);
            }

          });
        }
      });
    }
    delete(voucher){
      this.BVoucher.deleteVoucher(voucher._id);
      this.$state.reload();      
    }
    updateVoucher(voucher){
      alert("update voucher: " + voucher.alias);
    }
    newVoucher(){
      alert("new vucher");
    }
    save(){
      var ctrl = this;
      var initList = [];
      this.defaultVouchers.forEach(function(v){
         if(v.checked)
            initList.push(v.name);
      });
      
      if(initList.length > 0){
        this.BVoucher.initVouchers(initList).then(function(data){
           ctrl.allVouchers = data;
           ctrl.isInit = true;
           
        });
      }
      
    }
  }


  class VoucherAdminHomeController {
    constructor() {
      this.vouchers = [{}, {}, {}, {}, {}, {}];
    }
  }

  class VoucherAdminAddVoucherController {
    constructor($stateParams, $rootScope) {
      $rootScope.breadcrumb.addVoucher = ($stateParams.voucherId && $stateParams.voucherId > 0) ? '修改优惠券' : '添加优惠券';
      this.vouhcer = {
        id: 1,
        name: 'voucher1',
        alias: '优惠券1',
        typeId: 1,
        discount: 3,
        money: 90,
        minCustomer: 2,
        allowMinExpense: 100,
        advanceDay: 1,
        extendDay: 1,
        startTime: '2016-3-30',
        endTime: '2016-4-5',
        description: '优惠券1描述',
        status: 0
      };
      this.vouchersType = [
        { id: 1, alias: '优惠券类型1' }
      ];
      this.allowAssigners = [
        { id: 'manager', alias: '管理员发放' },
        { id: 'system', alias: '系统自动发放' },
        { id: 'cashier', alias: '收银员发放' }
      ];
      this.voucherPermits = [
        { id: 1, alias: '可申请' },
        { id: 2, alias: '可领取' },
        { id: 3, alias: '可使用' }
      ];
    }
  }

  class VoucherAdminTypeListController {
    constructor(BVoucher) {
      var ctrl = this;
      BVoucher.getTypes().then(function (types) {
        ctrl.voucherTypes = types;
      });
    }
  }

  class VoucherAdminAddTypeController {
    constructor($state, $stateParams, $rootScope, BVoucher) {
      this.$state = $state;
      this.BVoucher = BVoucher;
      $rootScope.breadcrumb.addType = ($stateParams.typeId && $stateParams.typeId > 0) ? '修改优惠券类型' : '添加优惠券类型';
      this.voucherType = {
        name: '',
        alias: ''
      }
    }

    addVoucherType(form) {
      var ctrl = this;
      if (form.$valid) {
        this.BVoucher.addType(this.voucherType).then(function (result) {
          ctrl.$state.go('pc.space.app.voucher.admin.typeList');
        });
      }
    }
  }

  angular.module('billynApp.nut')
    .controller('VoucherController', VoucherController)
    .controller('VoucherHomeController', VoucherHomeController)
    .controller('AdminVoucherController', AdminVoucherController)
    .controller('AdminVoucherHomeController', AdminVoucherHomeController)
    .controller('VoucherAdminHomeController', VoucherAdminHomeController)
    .controller('VoucherAdminAddVoucherController', VoucherAdminAddVoucherController)
    .controller('VoucherAdminTypeListController', VoucherAdminTypeListController)
    .controller('VoucherAdminAddTypeController', VoucherAdminAddTypeController);
})();
