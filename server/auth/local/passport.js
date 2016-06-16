import passport from 'passport';
import {Strategy as LocalStrategy} from 'passport-local';

/*
function localAuthenticate(User, email, password, done) {
  User.find({
    where: {
      email: email.toLowerCase()
    }
  })
    .then(user => {
      if (!user) {
        return done(null, false, {
          message: 'This email is not registered.'
        });
      }
      user.authenticate(password, function(authError, authenticated) {
        if (authError) {
          return done(authError);
        }
        if (!authenticated) {
          return done(null, false, { message: 'This password is not correct.' });
        } else {
          return done(null, user);
        }
      });
    })
    .catch(err => done(err));
}
*/
function localAuthenticate(User, loginId, password, done) {
  //console.log('userId:',userId);
  User.find({
    where: {
      //email: email
      loginId: loginId
    }
  })
    .then(user => {
      if (!user) {
        return done(null, false, {
          message: 'This loginId is not registered.'
        });
      }
      user.authenticate(password, function(authError, authenticated) {
        if (authError) {
          return done(authError);
        }
        if (!authenticated) {
          return done(null, false, { message: 'This password is not correct.' });
        } else {
          return done(null, user);
        }
      });
    })
    .catch(err => done(err));
}

/*
export function setup(User, config) {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password' // this is the virtual field on the model
  }, function(email, password, done) {
    return localAuthenticate(User, email, password, done);
  }));
}
*/
export function setup(User, config) {
  passport.use(new LocalStrategy({
    usernameField: 'loginId',
    passwordField: 'password' // this is the virtual field on the model
  }, function(loginId, password, done) {
    return localAuthenticate(User, loginId, password, done);
  }));
}