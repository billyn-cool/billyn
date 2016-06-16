'use strict';

class LoginController {
  constructor(Auth, $state, $rootScope) {
    this.user = {};
    this.errors = {};
    this.submitted = false;

    this.Auth = Auth;
    this.$state = $state;
    this.$rootScope = $rootScope;

    Auth.isLoggedIn() && $state.go('pc.dashboard');
  }

  login(form) {
    this.submitted = true;

    if (form.$valid) {
      this.Auth.login({
        //email: this.user.email,
        loginId: this.user.loginId,
        password: this.user.password
      })
      .then(() => {
        // Logged in, redirect to home
        //this.$state.go('main');
        this.$state.go('pc.dashboard');
      })
      .catch(err => {
        this.errors.other = err.message;
      });
    }
  }
  changeLanguage(langKey){
      this.$rootScope.$translate.use(langKey);
  }
}

angular.module('billynApp')
  .controller('LoginController', LoginController);
