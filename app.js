const express = require('express')
const { engine } = require('express-handlebars')
const app = express()
const port = 3000
const restaurants = require('./public/jsons/restaurants.json').results


app.engine('.hbs', engine({ extname: '.hbs' }))
app.set('view engine', '.hbs')
app.set('views', './views')
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.redirect('/restaurants')
})

app.get('/restaurants', (req, res) => {
  const keyword = req.query.keyword?.trim()
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

app.get('/restaurant/:id', (req, res) => {
  const id = req.params.id
  const restaurant = restaurants.find((store) => store.id.toString() === id)
  res.render('detail', { restaurant: restaurant })
})

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})