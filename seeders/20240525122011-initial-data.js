'use strict';

const restaurants = require('../public/jsons/restaurants.json')
const bcrypt = require('bcryptjs')

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    let transaction

    try {
      transaction = await queryInterface.sequelize.transaction()

      const hash = await bcrypt.hash('12345678', 10)

      await queryInterface.bulkInsert('Users', [
        {
          id: 5,
          name: 'user1',
          email: 'user1@example.com',
          password: hash,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 6,
          name: 'user2',
          email: 'user2@example.com',
          password: hash,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { transaction }
      )

      const restaurantData = restaurants.results.map((restaurant, index) =>
      ({
        name: restaurant.name,
        name_en: restaurant.name_en,
        category: restaurant.category,
        image: restaurant.image,
        location: restaurant.location,
        phone: restaurant.phone,
        googlemap: restaurant.google_map,
        rating: restaurant.rating,
        description: restaurant.description,
        userId: index < 3 ? 5 : 6,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      )

      await queryInterface.bulkInsert('Restaurants', restaurantData, { transaction })
      await transaction.commit()
    } catch (error) {
      if (transaction) await transaction.rollback()
      console.error('Error while seeding data: ', error)
    }
  },


  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Restaurants', null)
    await queryInterface.bulkDelete('Users', null)
  }
};
