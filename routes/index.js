const express = require('express')
const router = express.Router()

const restaurants = require('./restaurants')

router.use('/restaurants', restaurants)

router.get('/', (req, res) => {
  res.redirect('/restaurants')
})

module.exports = router