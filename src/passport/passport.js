const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Assistant = mongoose.model('Assistant');

// Verifies login. Checks for username. If it exists sends password to method defined in schema.
passport.use(new LocalStrategy((username, password, done) => {
  Assistant.findOne({ username: username }).exec()
  .then(user => {
    if (!user) {
      return done(null, false, { message: 'Vi hittade inget konto med det användarnamnet.' });
    }
    user.validPassword(password)
      .then( valid => valid ? done(null, user) : done(null, false, { message: 'Felaktigt lösenord. Var god försök igen.' }))
      .catch( err => done(err));
  })
  .catch((err) => done(err));
}));
