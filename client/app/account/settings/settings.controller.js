'use strict';

class SettingsController {
  constructor(Auth, $state) {
    this.errors = {};
    this.submitted = false;

    this.Auth = Auth;

    // Init the nav title.
    if(/^pc\.settings\.profile/.test($state.current.name)) {
      this.nav = 'email';
    } else {
      this.nav = 'backBtn';
    }
  }

  changePassword(form) {
    this.submitted = true;

    if (form.$valid) {
      this.Auth.changePassword(this.user.oldPassword, this.user.newPassword)
        .then(() => {
          this.message = 'Password successfully changed.';
        })
        .catch(() => {
          form.password.$setValidity('mongoose', false);
          this.errors.other = 'Incorrect password';
          this.message = '';
        });
    }
  }
}

class ProfileController {
  constructor(Auth, $rootScope) {
    var user = Auth.getCurrentUser();
    $rootScope.current.user = user;
    console.log('$rootScope.current.user:',$rootScope.current.user);
  }
}

angular.module('billynApp')
  .controller('SettingsController', SettingsController)
  .controller('ProfileController', ProfileController);
