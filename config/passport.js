const bcrypt = require('bcryptjs')

const passport = require('passport')
const LocalStrategy = require('passport-local')
const FacebookStrategy = require('passport-facebook')

const db = require('../models')
const User = db.User


passport.use(new LocalStrategy({ usernameField: 'email' }, (username, password, done) => {
  return User.findOne({
    attributes: ['id', 'name', 'email', 'password'],
    where: { email: username },
    raw: true
  })
    .then((user) => {
      if (!user) {
        return done(null, false, { message: 'email或密碼錯誤！' })
      }
      return bcrypt.compare(password, user.password)
        .then((isMatch) => {
          if (!isMatch) {
            return done(null, false, { message: 'email或密碼錯誤！' })
          }
          return done(null, user)
        })
    })
    .catch((error) => {
      error.errorMessage = '登入失敗'
      return done(error)
    })
}))

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: process.env.FACEBOOK_CALLBACK_URL,
  profileFields: ['email', 'displayName']
}, (accessToken, refreshToken, profile, done) => {
  const name = profile.displayName
  const email = profile.emails[0].value

  return User.findOne({
    attributes: ['id', 'name', 'email'],
    where: { email },
    raw: true
  })
    .then((user) => {
      // if user can be found, it means this user had been logged in with Facebook before.
      if (user) return done(null, user)

      // if user can not be found, so create this user with random password.
      const randomPwd = Math.random().toString(36).slice(-8)

      return bcrypt.hash(randomPwd, 10)
        .then((hash) => User.create({ name, email, password: hash }))
        .then((user) => done(null, { id: user.id, name: user.name, email: user.email }))
    })
    .catch((error) => {
      error.errorMessage = '登入失敗'
      return done(error)
    })
}
));

passport.serializeUser((user, done) => {
  const { id, name, email } = user
  return done(null, { id, name, email })
})

passport.deserializeUser((user, done) => {
  return done(null, { id: user.id, name: user.name})
})


module.exports = passport