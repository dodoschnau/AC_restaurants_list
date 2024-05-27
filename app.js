const express = require('express')
const { engine } = require('express-handlebars')
const methodOverride = require('method-override')
const app = express()
const port = 3000

const db = require('./models')
const { where } = require('sequelize')
const Restaurant = db.Restaurant

app.engine('.hbs', engine({
  extname: '.hbs',
  // need to check if 'a' is equal to 'b'
  helpers: {
    eq: (a, b) => a === b
  }
}))

app.set('view engine', '.hbs')
app.set('views', './views')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))

app.get('/', (req, res) => {
  res.redirect('/restaurants')
})

app.get('/restaurants', (req, res) => {
  const keyword = req.query.keyword?.trim()

  return Restaurant.findAll({
    attributes: [`id`, `image`, `name`, `category`, `rating`],
    raw: true
  })

    .then((restaurants) => {
      const matchedRestaurants = keyword ? restaurants.filter((store) =>
        Object.values(store).some((content) => {
          if (typeof content === 'string') {
            return content.toLowerCase().includes(keyword.toLowerCase())
          }
          return false
        })
      ) : restaurants
      res.render('index', { restaurants: matchedRestaurants, keyword })
    })

    .catch((err) => console.log(err))
})

app.get('/restaurants/new', (req, res) => {
  res.render('new')
})


app.get('/restaurants/:id', (req, res) => {
  const id = req.params.id
  return Restaurant.findByPk(id, {
    attributes: [`id`, `name`, `name_en`, `category`, `rating`, `location`, `googlemap`, `phone`, `description`, `image`],
    raw: true
  })
    .then((restaurant) => res.render('detail', { restaurant }))
    .catch((err) => console.log(err))
})

app.get('/restaurants/:id/edit', (req, res) => {
  const id = req.params.id
  return Restaurant.findByPk(id, {
    attributes: [`id`, `name`, `name_en`, `category`, `rating`, `location`, `googlemap`, `phone`, `description`, `image`],
    raw: true
  })
    .then((restaurant) => res.render('edit', { restaurant }))
    .catch((err) => console.log(err))
})

app.post('/restaurants', (req, res) => {
  const name = req.body.name
  const name_en = req.body.name_en
  const category = req.body.category
  const image = req.body.image
  const location = req.body.location
  const phone = req.body.phone
  const googlemap = req.body.googlemap
  const rating = req.body.rating
  const description = req.body.description

  return Restaurant.create({ name, name_en, category, image, location, phone, googlemap, rating, description })
    .then(() => { res.redirect('/restaurants') })
    .catch((err) => { console.log(err) })
})

app.put('/restaurants/:id', (req, res) => {
  const id = req.params.id
  const name = req.body.name
  const name_en = req.body.name_en
  const category = req.body.category
  const image = req.body.image
  const location = req.body.location
  const phone = req.body.phone
  const googlemap = req.body.googlemap
  const rating = req.body.rating
  const description = req.body.description

  return Restaurant.update({ name, name_en, category, image, location, phone, googlemap, rating, description }, { where: { id } })
    .then(() => { res.redirect(`/restaurants/${id}`) })
    .catch((err) => { console.log(err) })
})

app.delete('/restaurants/:id', (req, res) => {
  const id = req.params.id
  return Restaurant.destroy({ where: { id } })
    .then(() => { res.redirect('/restaurants') })
})

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})