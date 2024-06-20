module.exports = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  req.flash('error', '您尚未登入！')
  return res.redirect('login')
}