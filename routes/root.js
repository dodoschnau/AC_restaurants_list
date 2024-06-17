const express = require('express')
const passport = require('passport')
const router = express.Router()


router.get('/', (req, res) => {
  res.redirect('/restaurants')
})

router.get('/login', (req, res) => {
  res.render('login')
})

router.get('/register', (req, res) => {
  res.render('register')
})

// Login
router.post('/login', passport.authenticate('local', {
  successRedirect: '/restaurants',
  failureRedirect: '/login',
  failureFlash: true
}))

// Logout
router.post('/logout', (req, res) => {
  req.logout((error) => {
    if (error) {
      next(error)
    }
    req.flash('success', '登出成功！')
    return res.redirect('/login')
  })
})


module.exports = router