const express = require('express')
const { engine } = require('express-handlebars')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
const app = express()
const port = 3000
const router = require('./routes')

const messageHandler = require('./middlewares/message-handler.js')
const errorHandler = require('./middlewares/error-handler.js')


if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
}
console.log('env', process.env.NODE_ENV)

const passport = require('./config/passport.js')

app.engine('.hbs', engine({
  extname: '.hbs',
  // need to check if 'a' is equal to 'b'
  helpers: {
    eq: (a, b) => a === b,
    defaultName: (name) => {
      return name || 'noName'
    }
  }
}))

app.set('view engine', '.hbs')
app.set('views', './views')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session())

app.use(messageHandler)

app.use(router)

app.use(errorHandler)

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})