const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')

const db = require('../models')
const User = db.User

// Register
router.post('/', (req, res, next) => {
  const { userName, email, password, confirmPassword } = req.body

  if (!email || !password) {
    req.flash('error', 'email及password為必填！')
    return res.redirect('back')
  }
  if (password !== confirmPassword) {
    req.flash('error', '密碼與驗證密碼不相符')
    return res.redirect('back')
  }

  return User.count({ where: { email } })
    .then((rowCount) => {
      if (rowCount > 0) {
        req.flash('error', '該email已被註冊！')
        return
      }
      return bcrypt.hash(password, 10)
        .then((hash) => User.create({ userName, email, password: hash }))
    })
    .then((user) => {
      if (!user) {
        return res.redirect('back')
      }
      req.flash('success', '註冊成功！')
      return res.redirect('/login')
    })
    .catch((error) => {
      error.errorMassage = '註冊失敗:('
      next(error)
    })
})

module.exports = router