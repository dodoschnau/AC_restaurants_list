const express = require('express')
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
router.post('/login', (req, res) => {
  res.send('POST Login')
})

// Logout
router.post('/logout', (req, res) => {
  res.send('POST Logout')
})


module.exports = router