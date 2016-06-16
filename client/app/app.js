'use strict';

var translationsZH = {
  BILLYNPLATFORM: '比邻平台',
  BILLYNLANGUAGE: '中文',
  appEngine: '系统应用',
  space: "机构",
  role: "角色",
  collab: "合作",
  LOGIN_PAGE: {
    LOGIN: '登 录',
    SIGNUP: '注 册',
    PASSWORD: '密码',
    REMEMBERME: '记住我',
    USERLOGIN: '用户登录',
    SOCIALMEDIALOGIN: '通过社交账号登录',
    NEWUSER: '新用户',
    IDENTIFIERS: '邮箱/手机号/ID',
  },
  SIGNUP_PAGE: {
    NEWUSERSIGNUP: '新用户注册',
    USERNAME: '用户名',
    IDENTIFIERS: "@:LOGIN_PAGE.IDENTIFIERS",
    PASSWORD: "@:LOGIN_PAGE.PASSWORD",
    CONFIRMPASSWORD: "确认密码",
    SIGNUP: "@:LOGIN_PAGE.SIGNUP",
    REGISTERING: '注 册 中',
    BACKTOLOGIN: "返回登录",
  },
};

var translationsEN = {
  BILLYNPLATFORM: 'Billyn Platform',
  BILLYNLANGUAGE: 'English',
  appEngine: 'App Engine',
  LOGIN_PAGE: {
    LOGIN: 'Login',
    SIGNUP: 'Sign Up',
    PASSWORD: 'Password',
    REMEMBERME: 'Remember Me',
    USERLOGIN: 'User Login',
    SOCIALMEDIALOGIN: 'Login with:',
    NEWUSER: 'New User',
    IDENTIFIERS: 'Email/Phone/ID',
  },
  SIGNUP_PAGE: {
    NEWUSERSIGNUP: 'New User Sign Up',
    USERNAME: 'User Name',
    IDENTIFIERS: "@:LOGIN_PAGE.IDENTIFIERS",
    PASSWORD: "@:LOGIN_PAGE.PASSWORD",
    CONFIRMPASSWORD: "Confirm Password",
    SIGNUP: "@:LOGIN_PAGE.SIGNUP",
    REGISTERING: "@:LOGIN_PAGE.SIGNUP",
    BACKTOLOGIN: "Back to Login",
  },
  NUT: {
    space: "space",
    role: "role",
    collab: "collab",
  },
};

angular.module('billynApp', [
  'billynApp.auth',
  'billynApp.admin',
  'billynApp.constants',
  'billynApp.core',
  'billynApp.nut',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.router',
  'ui.bootstrap',
  'smart-table',
  'validation.match',
  'angularModalService',
  'pascalprecht.translate',
  'toaster',
  'ngAnimate'
])
  .config(function ($urlRouterProvider, $locationProvider, $translateProvider) {
    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    $translateProvider.translations('zh', translationsZH).
      translations('en', translationsEN).
      registerAvailableLanguageKeys(['en', 'zh'], {
        'en_*': 'en',
        'en-*': 'en',
        'zh_*': 'zh',
        'zh-*': 'zh',
      }).
      determinePreferredLanguage().
      fallbackLanguage('en');
  }).run(function ($translate, $rootScope) {
    $rootScope.$translate = $translate;
  });
