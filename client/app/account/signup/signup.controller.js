'use strict';

class SignupController {
  //start-non-standard
  user = {};
  error = {};
  submitted = false;
  //end-non-standard

  constructor(Auth, $state) {
    this.Auth = Auth;
    this.$state = $state;
    this.registering = false;
  }

  register(form) {
    this.submitted = true;
    
    if (form.$valid) {
      this.registering = true;
      this.Auth.createUser({
        loginId: this.user.loginId,
        // email: this.user.email,
        password: this.user.password
      })
      .then(() => {
        // Account created, redirect to home
        this.$state.go('pc.dashboard');
      })
      .catch(err => {
        this.registering = false;
        // err = err.data;
        if(err.name) {
          this.error.name = err.name;
          this.error.message = err.message;
        }

        // Update validity of form fields that match the sequelize errors
        // if (err.name) {
        //   angular.forEach(err.fields, field => {
        //     form[field].$setValidity('mongoose', false);
        //     this.errors[field] = err.message;
        //   });
        // }
      });
    }
  }
}

angular.module('billynApp')
  .controller('SignupController', SignupController);
