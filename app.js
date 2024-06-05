const express = require('express')
const { engine } = require('express-handlebars')
const methodOverride = require('method-override')
const flash = require('connect-flash')
const session = require('express-session')
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

app.use(session({
  secret: 'ThisIsSecret',
  resave: false,
  saveUninitialized: false
}))
app.use(flash())

app.get('/', (req, res) => {
  res.redirect('/restaurants')
})

app.get('/restaurants', (req, res) => {
  try {
    const keyword = req.query.keyword?.trim()
    const sort = req.query.sort

    let order = []
    switch (sort) {
      case 'nameAsc':
        order.push(['name', 'ASC']);
        break;
      case 'nameDesc':
        order.push(['name', 'DESC']);
        break;
      case 'category':
        order.push(['category', 'ASC']);
        break;
      case 'location':
        order.push(['location', 'ASC']);
        break;
      default:
        order.push(['id', 'ASC']);
        break;
    }

    return Restaurant.findAll({
      attributes: ['id', 'image', 'name', 'category', 'rating', 'location'],
      order,
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
        res.render('index', { restaurants: matchedRestaurants, keyword, sort, message: req.flash('success'), error: req.flash('error') })
      })

      .catch((error) => {
        console.error(error)
        req.flash('error', '資料取得失敗')
        return res.redirect('back')
      })
  } catch (error) {
    console.error(error)
    req.flash('error', '伺服器錯誤')
    return res.redirect('back')
  }
})

app.get('/restaurants/new', (req, res) => {
  try {
    res.render('new', { error: req.flash('error') })
  } catch (error) {
    console.error(error)
    req.flash('error', '伺服器錯誤')
    return res.redirect('back')
  }
})


app.get('/restaurants/:id', (req, res) => {
  try {
    const id = req.params.id
    return Restaurant.findByPk(id, {
      attributes: ['id', 'name', 'name_en', 'category', 'rating', 'location', 'googlemap', 'phone', 'description', 'image'],
      raw: true
    })
      .then((restaurant) => res.render('detail', { restaurant, message: req.flash('success'), error: req.flash('error') }))
      .catch((error) => {
        console.error(error)
        req.flash('error', '資料取得失敗')
        return res.redirect('back')
      })
  } catch (error) {
    console.error(error)
    req.flash('error', '伺服器錯誤')
    return res.redirect('back')
  }
})

app.get('/restaurants/:id/edit', (req, res) => {
  try {
    const id = req.params.id
    return Restaurant.findByPk(id, {
      attributes: ['id', 'name', 'name_en', 'category', 'rating', 'location', 'googlemap', 'phone', 'description', 'image'],
      raw: true
    })
      .then((restaurant) => res.render('edit', { restaurant, error: req.flash('error') }))
      .catch((error) => {
        console.error(error)
        req.flash('error', '讀取網頁失敗')
        return res.redirect('back')
      })
  } catch (error) {
    console.error(error)
    req.flash('error', '伺服器錯誤')
    return res.redirect('back')
  }
})

app.post('/restaurants', (req, res) => {
  try {
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
      .then(() => {
        req.flash('success', '新增成功！')
        return res.redirect('/restaurants')
      })
      .catch((error) => {
        console.error(error)
        req.flash('error', '新增失敗:(')
        return res.redirect('back')
      })
  } catch (error) {
    console.error(error)
    req.flash('error', '伺服器錯誤')
    return res.redirect('back')
  }
})

app.put('/restaurants/:id', (req, res) => {
  try {
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
      .then(() => {
        req.flash('success', '編輯成功！')
        return res.redirect(`/restaurants/${id}`)
      })
      .catch((error) => {
        console.error(error)
        req.flash('error', '編輯失敗:(')
        return res.redirect('back')
      })
  } catch (error) {
    console.error(error)
    req.flash('error', '伺服器錯誤')
    return res.redirect('back')
  }
})

app.delete('/restaurants/:id', (req, res) => {
  try {
    const id = req.params.id
    return Restaurant.destroy({ where: { id } })
      .then(() => {
        req.flash('success', '刪除成功！')
        return res.redirect('/restaurants')
      })
      .catch((error) => {
        console.error(error)
        req.flash('error', '刪除失敗:(')
        return res.redirect('back')
      })
  } catch (error) {
    console.error(error)
    req.flash('error', '伺服器錯誤')
    return res.redirect('back')
  }

})

app.listen(port, () => {
  console.log(`express server is running on http://localhost:${port}`)
})