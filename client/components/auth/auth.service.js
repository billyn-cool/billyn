'use strict';

(function() {

  function AuthService($location, $http, $cookies, $q, appConfig, Util, User, BUser, BSpace, BApp, $rootScope) {
    var safeCb = Util.safeCb;
    var currentUser = {};
    var userRoles = appConfig.userRoles || [];
    $rootScope.current = $rootScope.current || {};

    if ($cookies.get('token') && $location.path() !== '/logout') {
      currentUser = User.get();
    }

    var Auth = {

    /**
     * Authenticate user and save token
     *
     * @param  {Object}   user     - login info
     * @param  {Function} callback - optional, function(error, user)
     * @return {Promise}
     */
    //login({email, password}, callback) {
      login({loginId, password}, callback) {
        return $http.post('/auth/local', {
        //email: email,
        loginId: loginId,
        password: password
      })
        .then(res => {
          $cookies.put('token', res.data.token);
          currentUser = User.get();

          var user = currentUser.$promise;

          return user;
        })
        .then(user => {
    	  //set current user
    	  $rootScope.current.user = user;
        return BSpace.getUserSpaces({
         userId: user._id,
         type: 'space.person.normal'
       }).then(spaces => {
			  //set current space
			  $rootScope.current.space = spaces[0];
			  return BApp.find('appEngine').then(app => {
				  //set current app
				  $rootScope.current.app = app;
				  return null;
       });
      }).then(function(){
       return user;
     });
    })
        .then(user => {		 
          safeCb(callback)(null, user);
          return user;
        })
        .catch(err => {
          Auth.logout();
          safeCb(callback)(err.data);
          return $q.reject(err.data);
        });
      },

    /**
     * Delete access token and user info
     */
     logout() {
      $cookies.remove('token');
      currentUser = {};
    },

    /**
     * Create a new user
     *
     * @param  {Object}   user     - user info
     * @param  {Function} callback - optional, function(error, user)
     * @return {Promise}
     */
     createUser(userData, callback) {
      return $http.post('/api/users', userData).then(function(res){
        $cookies.put('token', res.data.token);
        currentUser = User.get();

        var user = currentUser.$promise;

        return user;

      }).then(function(newUser){
       $rootScope.current.user = newUser;
       var tName = newUser.name;
       if(newUser.name){
        tName = newUser.name;
      }else
      {
        tName = newUser.loginId;
      }
      return BSpace.create({
        name: 'mySpace_' + tName,
        alias: 'mySpace belong to ' + tName,
        roles:['admin'],
        type: 'person.normal'
      }).then(function(space){
        $rootScope.current.space = space;
        return BApp.find('appEngine').then(function(app){
         $rootScope.current.app = app;
         return null;
       });
      }).then(function(){
        return newUser;
      });
    }).then(user => {		 
      safeCb(callback)(null, user);
      return user;
    })
    .catch(err => {
      Auth.logout();
      safeCb(callback)(err.data);
      return $q.reject(err.data);
    });
		/*
		return $q(function(resolve, reject){
	        return User.save(user,
	          function(data) {
	  			return $q(function(resolve,reject){
	  				$cookies.put('token', data.token);
	  				currentUser = User.get();
	  				var user = currentUser.$promise;
	  				resolve(user);
	  			}).then(function(newUser){
	  	        	$rootScope.current.user = newUser;
	  			  	return BSpace.create({
	  			  		name: 'mySpace_' + newUser.name,
	  			  		alias: 'mySpace belong to ' + newUser.name,
	  			  		type: 'person.normal'
	  		  		}).then(function(space){
	  		  			$rootScope.current.space = space;
	  					return BApp.find('appEngine').then(function(app){
	  						return $rootScope.current.app = app;
	  					});
	  		  		}).then(function(){
	  		  			return newUser;
	  		  		});
	  			});
		  
	  		  //return safeCb(callback)(null, newUser);		 	
	          },
	          function(err) {
	            Auth.logout();
	            return safeCb(callback)(err);
	          });
          });*/      
        },

    /**
     * Change password
     *
     * @param  {String}   oldPassword
     * @param  {String}   newPassword
     * @param  {Function} callback    - optional, function(error, user)
     * @return {Promise}
     */
     changePassword(oldPassword, newPassword, callback) {
      return User.changePassword({ id: currentUser._id }, {
        oldPassword: oldPassword,
        newPassword: newPassword
      }, function() {
        return safeCb(callback)(null);
      }, function(err) {
        return safeCb(callback)(err);
      }).$promise;
    },

    /**
     * Gets all available info on a user
     *   (synchronous|asynchronous)
     *
     * @param  {Function|*} callback - optional, funciton(user)
     * @return {Object|Promise}
     */
     getCurrentUser(callback) {

      if (arguments.length === 0) {
		  /*
		  if(currentUser.hasOwnProperty('$promise')){
			  if(currentUser.hasOwnProperty('$resolved') && currentUser.$resolved === true){
				  return currentUser;
			  }else{
				  return currentUser.$promise;
			  }
      }*/
      return currentUser;
    }

    var value = (currentUser.hasOwnProperty('$promise')) ?
    currentUser.$promise : currentUser;
    return $q.when(value)
    .then(user => {
      safeCb(callback)(user);
      return user;
    }, () => {
      safeCb(callback)({});
      return {};
    });
  },

    /**
     * Check if a user is logged in
     *   (synchronous|asynchronous)
     *
     * @param  {Function|*} callback - optional, function(is)
     * @return {Bool|Promise}
     */
     isLoggedIn(callback) {
      if (arguments.length === 0) {
        //return currentUser.hasOwnProperty('role');
        return currentUser.hasOwnProperty('_id');
      }

      return Auth.getCurrentUser(null)
      .then(user => {
          //var is = user.hasOwnProperty('role');
          var is = user.hasOwnProperty('_id');
          safeCb(callback)(is);
          return is;
        });
    },

     /**
      * Check if a user has a specified role or higher
      *   (synchronous|asynchronous)
      *
      * @param  {String}     role     - the role to check against
      * @param  {Function|*} callback - optional, function(has)
      * @return {Bool|Promise}
      */
      hasRole(role, callback) {
        var hasRole = function(r, h) {
          return userRoles.indexOf(r) >= userRoles.indexOf(h);
        };

        if (arguments.length < 2) {
          return hasRole(currentUser.role, role);
        }

        return Auth.getCurrentUser(null)
        .then(user => {
          var has = (user.hasOwnProperty('role')) ?
          hasRole(user.role, role) : false;
          safeCb(callback)(has);
          return has;
        });
      },

     /**
      * Check if a user is an admin
      *   (synchronous|asynchronous)
      *
      * @param  {Function|*} callback - optional, function(is)
      * @return {Bool|Promise}
      */
      isAdmin() {
        return Auth.hasRole
        .apply(Auth, [].concat.apply(['admin'], arguments));
      },

    /**
     * Get auth token
     *
     * @return {String} - a token string used for authenticating
     */
     getToken() {
      return $cookies.get('token');
    }
  };

  return Auth;
}

angular.module('billynApp.auth')
.factory('Auth', AuthService);

})();
