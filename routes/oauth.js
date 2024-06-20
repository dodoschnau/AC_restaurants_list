const express = require('express')
const router = express.Router()
const passport = require('passport')

router.get('/login/facebook',
  passport.authenticate('facebook', { scope: ['email'] }));

router.get('/facebook/callback',
  passport.authenticate('facebook', {
    successRedirect: '/restaurants',
    failureRedirect: '/login',
    failureFlash: true
  }));

module.exports = router