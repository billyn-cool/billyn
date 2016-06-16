'use strict';

(function () {

  class WeChatHomeController {
    constructor() {
    }
  }
  class ConfigController {
    constructor($state, WeChatService) {
      this.$state = $state;
      this.WeChatService = WeChatService;
      this.types = [
        {value: 'authService', name: '认证服务号'},
        {value: 'authSubscribe', name: '认证订阅号'},
        {value: 'commonService', name: '普通服务号'},
        {value: 'commonSubscribe', name: '普通订阅号'}
      ];
    }

    save(weChatData) {
      this.WeChatService.weChatData = new Array();
      this.WeChatService.weChatData.push(weChatData);
      this.$state.go('weChat.config');
    }
  }
  class MenuController {
    constructor($state, WeChatService) {
      this.$state = $state;
      this.WeChatService = WeChatService;
    }

    save(menuData) {
      this.WeChatService.menuData = new Array();
      this.WeChatService.menuData.push(menuData);
      this.$state.go('weChat.menu');
    }
  }
  class KeyWordsController {
    constructor($state, WeChatService) {
      this.$state = $state;
      this.WeChatService = WeChatService;
    }

    saveSingle(singleData) {
      this.WeChatService.singleData = new Array();
      this.WeChatService.singleData.push(singleData);
      this.$state.go('weChat.keyWord.single');
    }

    saveMult(multData) {
      this.WeChatService.multData = new Array();
      this.WeChatService.multData.push(multData);
      this.$state.go('weChat.keyWord.mult');
    }

    saveText(textData) {
      this.WeChatService.textData = new Array();
      this.WeChatService.textData.push(textData);
      this.$state.go('weChat.keyWord.text');
    }
  }
  class MassController {
    constructor($state, WeChatService) {
      this.$state = $state;
      this.WeChatService = WeChatService;
    }

    save(massData) {
      this.WeChatService.massData = new Array();
      this.WeChatService.massData.push(massData);
      this.$state.go('weChat.mass');
    }
  }
  class SiteController {
    constructor($state, WeChatService) {
      this.$state = $state;
      this.WeChatService = WeChatService;
    }

    saveCategory(categoryData) {
      this.WeChatService.categoryData = new Array();
      this.WeChatService.categoryData.push(categoryData);
      this.$state.go('weChat.site.category');
    }

    saveSlide(slideData) {
      this.WeChatService.slideData = new Array();
      this.WeChatService.slideData.push(slideData);
      this.$state.go('weChat.site.slide');
    }

    saveText(textData) {
      this.WeChatService.textData = new Array();
      this.WeChatService.textData.push(textData);
      this.$state.go('weChat.site.template');
    }
  }
  angular.module('billynApp')
    .controller('WeChatHomeController', WeChatHomeController)
    .controller('ConfigController', ConfigController)
    .controller('MenuController', MenuController)
    .controller('KeyWordsController', KeyWordsController)
    .controller('MassController', MassController)
    .controller('SiteController', SiteController);

})();
