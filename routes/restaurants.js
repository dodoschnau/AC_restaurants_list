const express = require('express')
const router = express.Router()

const db = require('../models')
const Restaurant = db.Restaurant

router.get('/', (req, res, next) => {
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
      res.render('index', { restaurants: matchedRestaurants, keyword, sort })
    })
    .catch((error) => {
      error.errorMessage = '資料取得失敗'
      next(error)
    })
})

router.get('/new', (req, res) => {
  res.render('new')
})


router.get('/:id', (req, res, next) => {
  const id = req.params.id
  return Restaurant.findByPk(id, {
    attributes: ['id', 'name', 'name_en', 'category', 'rating', 'location', 'googlemap', 'phone', 'description', 'image'],
    raw: true
  })
    .then((restaurant) => res.render('detail', { restaurant }))
    .catch((error) => {
      error.errorMessage = '資料取得失敗'
      next(error)
    })
})

router.get('/:id/edit', (req, res, next) => {
  const id = req.params.id
  return Restaurant.findByPk(id, {
    attributes: ['id', 'name', 'name_en', 'category', 'rating', 'location', 'googlemap', 'phone', 'description', 'image'],
    raw: true
  })
    .then((restaurant) => res.render('edit', { restaurant }))
    .catch((error) => {
      error.errorMessage = '資料取得失敗'
      next(error)
    })
})

router.post('/', (req, res, next) => {
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
      error.errorMessage = '新增失敗:('
      next(error)
    })
})

router.put('/:id', (req, res, next) => {
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
      error.errorMessage = '編輯失敗:('
      next(error)
    })
})

router.delete('/:id', (req, res, next) => {
  const id = req.params.id
  return Restaurant.destroy({ where: { id } })
    .then(() => {
      req.flash('success', '刪除成功！')
      return res.redirect('/restaurants')
    })
    .catch((error) => {
      error.errorMessage = '刪除失敗:('
      next(error)
    })
})


module.exports = router