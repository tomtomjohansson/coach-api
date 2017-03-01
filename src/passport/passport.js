const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
// const Assistant = mongoose.model('Assistant');
const db = require('../models/connectModels');

// Verifies login. Checks for username. If it exists sends password to method defined in schema.
passport.use(new LocalStrategy(
async (username, password, done) => {
  const Assistant = await db();
  Assistant.findOne({ username: username }).exec()
  .then(user => {
    if (!user) {
      return done(null, false, { message: 'Vi hittade inget konto med det användarnamnet.' });
    }
    if (!user.validPassword(password)) {
      return done(null, false, { message: 'Felaktigt lösenord. Var god försök igen.' });
    }
    return done(null, user);
  })
  .catch((err) => done(err));
//     if (err) { return done(err); }
//     if (!user) {
//       return done(null, false, { message: 'Vi hittade inget konto med det användarnamnet.' });
//     }
//     if (!user.validPassword(password)) {
//       return done(null, false, { message: 'Felaktigt lösenord. Var god försök igen.' });
//     }
//     return done(null, user);
//   });
  }
));
