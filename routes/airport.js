const express = require('express')
const { body } = require('express-validator')

const airportController = require('../controllers/airport')

const router = express.Router()

router.post('/add', [
    body('airport_name').isString().trim().not().isEmpty(),
    body('airport_capacity').isNumeric().trim().custom(value => {
        if (value < 0) {
            return Promise.reject('Capacity should be greater then 0')
        }
        return Promise.resolve()
    }),
], airportController.add)

router.get('/airports', airportController.airports)


module.exports = router