'use strict';

angular.module('billynApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('weChat', {
        abstract: true,
        url: '/weChat',
        templateUrl: 'components/blyn/core/user/view/userLayout.html',
        authenticate: true
      })
      .state('weChat.home', {
        url: '/home',
        templateUrl: 'components/blyn/nuts/wechat/view/weChatHome.html',
        controller: 'WeChatHomeController',
        controllerAs: 'weChatHome'
      })
      .state('weChat.config', {
        url: '/config',
        templateUrl: 'components/blyn/nuts/wechat/view/config.html',
        controller: 'ConfigController',
        controllerAs: 'config'
      })
      .state('weChat.type', {
        url: '/type',
        templateUrl: 'components/blyn/nuts/wechat/view/config_type.html',
        controller: 'ConfigController',
        controllerAs: 'config'
      })
      .state('weChat.addWeChat', {
        url: '/addWeChat',
        templateUrl: 'components/blyn/nuts/wechat/view/addWeChat.html',
        controller: 'ConfigController',
        controllerAs: 'config'
      })
      .state('weChat.menu', {
        url: '/menu',
        templateUrl: 'components/blyn/nuts/wechat/view/menu.html',
        controller: 'MenuController',
        controllerAs: 'menu'
      })
      .state('weChat.addMenu', {
        url: '/addMenu',
        templateUrl: 'components/blyn/nuts/wechat/view/addMenu.html',
        controller: 'MenuController',
        controllerAs: 'menu'
      })
      .state('weChat.keyWord', {
        abstract: true,
        url: '/keyWord',
        templateUrl: 'components/blyn/nuts/wechat/view/keyWord.html',
        controller: 'KeyWordsController',
        controllerAs: 'keyWords'
      })
      .state('weChat.keyWord.single', {
        url: '/single',
        templateUrl: 'components/blyn/nuts/wechat/view/keyWord_single.html',
        controller: 'KeyWordsController',
        controllerAs: 'keyWords'
      })
      .state('weChat.keyWord.addSingle', {
        url: '/addSingle',
        templateUrl: 'components/blyn/nuts/wechat/view/addSingle.html',
        controller: 'KeyWordsController',
        controllerAs: 'keyWords'
      })
      .state('weChat.keyWord.mult', {
        url: '/mult',
        templateUrl: 'components/blyn/nuts/wechat/view/keyWord_mult.html',
        controller: 'KeyWordsController',
        controllerAs: 'keyWords'
      })
      .state('weChat.keyWord.addMult', {
        url: '/addMult',
        templateUrl: 'components/blyn/nuts/wechat/view/addMult.html',
        controller: 'KeyWordsController',
        controllerAs: 'keyWords'
      })
      .state('weChat.keyWord.text', {
        url: '/text',
        templateUrl: 'components/blyn/nuts/wechat/view/keyWord_text.html',
        controller: 'KeyWordsController',
        controllerAs: 'keyWords'
      })
      .state('weChat.keyWord.addText', {
        url: '/addText',
        templateUrl: 'components/blyn/nuts/wechat/view/addText.html',
        controller: 'KeyWordsController',
        controllerAs: 'keyWords'
      })
      .state('weChat.mass', {
        url: '/mass',
        templateUrl: 'components/blyn/nuts/wechat/view/mass.html',
        controller: 'MassController',
        controllerAs: 'mass'
      })
      .state('weChat.addMass', {
        url: '/addMass',
        templateUrl: 'components/blyn/nuts/wechat/view/addMass.html',
        controller: 'MassController',
        controllerAs: 'mass'
      })
      .state('weChat.site', {
        abstract: true,
        url: '/site',
        templateUrl: 'components/blyn/nuts/wechat/view/site.html',
        controller: 'SiteController',
        controllerAs: 'site'
      })
      .state('weChat.site.category', {
        url: '/category',
        templateUrl: 'components/blyn/nuts/wechat/view/site_categoru.html',
        controller: 'SiteController',
        controllerAs: 'site'
      })
      .state('weChat.site.addCategory', {
        url: '/addCategory',
        templateUrl: 'components/blyn/nuts/wechat/view/addCategory.html',
        controller: 'SiteController',
        controllerAs: 'site'
      })
      .state('weChat.site.slide', {
        url: '/slide',
        templateUrl: 'components/blyn/nuts/wechat/view/site_slide.html',
        controller: 'SiteController',
        controllerAs: 'site'
      })
      .state('weChat.site.addSlide', {
        url: '/addSlide',
        templateUrl: 'components/blyn/nuts/wechat/view/addSlide.html',
        controller: 'SiteController',
        controllerAs: 'site'
      })
      .state('weChat.site.template', {
        abstract: true,
        url: '/template',
        templateUrl: 'components/blyn/nuts/wechat/view/site_template.html',
        controller: 'MassController',
        controllerAs: 'mass'
      })
      .state('weChat.site.template.index', {
        url: '/index',
        templateUrl: 'components/blyn/nuts/wechat/view/site_template_index.html',
        controller: 'MassController',
        controllerAs: 'mass'
      })
      .state('weChat.site.template.list', {
        url: '/list',
        templateUrl: 'components/blyn/nuts/wechat/view/site_template_list.html',
        controller: 'MassController',
        controllerAs: 'mass'
      })
      .state('weChat.site.template.detail', {
        url: '/detail',
        templateUrl: 'components/blyn/nuts/wechat/view/site_template_detail.html',
        controller: 'MassController',
        controllerAs: 'mass'
      });
  });
