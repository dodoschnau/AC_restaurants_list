const express = require('express')
const router = express.Router()

const db = require('../models')
const Restaurant = db.Restaurant

const { Op } = require('sequelize')

router.get('/', (req, res, next) => {
  const keyword = req.query.keyword?.trim()
  const sort = req.query.sort
  const page = parseInt(req.query.page) || 1
  const limit = 9
  const offset = (page - 1) * limit

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

  let where = {}
  if (keyword) {
    where = {
      [Op.or]: [
        { name: { [Op.like]: `%${keyword}%` } },
        { description: { [Op.like]: `%${keyword}%` } },
        { category: { [Op.like]: `%${keyword}%` } }
      ]
    }
  }

  return Restaurant.findAndCountAll({
    attributes: ['id', 'image', 'name', 'category', 'rating', 'location'],
    where,
    order,
    limit,
    offset,
    raw: true
  })

    .then(({ count, rows }) => {
      const matchedRestaurants = keyword ? rows.filter((store) =>
        Object.values(store).some((content) => {
          if (typeof content === 'string') {
            return content.toLowerCase().includes(keyword.toLowerCase())
          }
          return false
        })
      ) : rows

      const totalPages = Math.ceil(count / limit)

      res.render('index', {
        restaurants: matchedRestaurants,
        keyword,
        sort,
        page,
        prev: page > 1 ? page - 1 : page,
        next: page < totalPages ? page + 1 : page,
        totalPages
      })
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