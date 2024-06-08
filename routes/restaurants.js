const express = require('express')
const router = express.Router()

const db = require('../models')
const Restaurant = db.Restaurant

const { Op } = require('sequelize')

router.get('/', (req, res, next) => {
  const keyword = req.query.keyword?.trim().toLowerCase() || ''
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

      const totalPages = Math.ceil(count / limit)

      res.render('index', {
        restaurants: rows,
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
  const { keyword, sort, page } = req.query
  return res.render('new', { keyword, sort, page })
})


router.get('/:id', (req, res, next) => {
  const id = req.params.id
  const { keyword, sort, page } = req.query

  return Restaurant.findByPk(id, {
    attributes: ['id', 'name', 'name_en', 'category', 'rating', 'location', 'googlemap', 'phone', 'description', 'image'],
    raw: true
  })
    .then((restaurant) => res.render('detail', {
      restaurant,
      sort,
      keyword,
      page
    }))
    .catch((error) => {
      error.errorMessage = '資料取得失敗'
      next(error)
    })
})

router.get('/:id/edit', (req, res, next) => {
  const id = req.params.id
  const { keyword, sort, page } = req.query

  return Restaurant.findByPk(id, {
    attributes: ['id', 'name', 'name_en', 'category', 'rating', 'location', 'googlemap', 'phone', 'description', 'image'],
    raw: true
  })
    .then((restaurant) => res.render('edit', {
      restaurant,
      sort,
      keyword,
      page
    }))
    .catch((error) => {
      error.errorMessage = '資料取得失敗'
      next(error)
    })
})

router.post('/', (req, res, next) => {
  const { name, name_en, category, image, location, phone, googlemap, rating, description } = req.body

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
  const { name, name_en, category, image, location, phone, googlemap, rating, description } = req.body
  const { keyword, sort, page } = req.query

  return Restaurant.update({ name, name_en, category, image, location, phone, googlemap, rating, description }, { where: { id } })
    .then(() => {
      req.flash('success', '編輯成功！')
      return res.redirect(`/restaurants/${id}?keyword=${keyword}&sort=${sort}&page=${page}`)
    })
    .catch((error) => {
      error.errorMessage = '編輯失敗:('
      next(error)
    })
})

router.delete('/:id', (req, res, next) => {
  const id = req.params.id
  const { keyword, sort, page } = req.query

  return Restaurant.destroy({ where: { id } })
    .then(() => {
      req.flash('success', '刪除成功！')
      return res.redirect(`/restaurants?keyword=${keyword}&sort=${sort}&page=${page}`)
    })
    .catch((error) => {
      error.errorMessage = '刪除失敗:('
      next(error)
    })
})


module.exports = router