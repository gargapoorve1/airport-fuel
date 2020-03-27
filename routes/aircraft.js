const express = require('express')
const { body } = require('express-validator')

const aircraftController = require('../controllers/aircraft')

const router = express.Router()

router.post('/add', [
    body('aircraft_no').isString().trim().not().isEmpty(),
    body('airline').isString().trim().not().isEmpty(),
    body('source').isString().trim().not().isEmpty(),
    body('destination').isString().trim().not().isEmpty()
], aircraftController.add)

router.get('/aircrafts', aircraftController.aircrafts)


module.exports = router