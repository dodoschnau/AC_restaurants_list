const express = require('express')
const router = express.Router()


const root = require('./root')
const users = require('./users')
const restaurants = require('./restaurants')


router.use('/', root)
router.use('/users', users)
router.use('/restaurants', restaurants)


module.exports = router