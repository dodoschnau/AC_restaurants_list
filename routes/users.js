const express = require('express')
const router = express.Router()


// Register
router.post('/', (req, res) => {
  res.send('POST Register')
})

module.exports = router