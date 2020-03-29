const express = require('express')
const { body } = require('express-validator')

const aircraftController = require('../controllers/aircraft')

const router = express.Router()

router.post('/add', [
    body('aircraft_no').trim(),
    body('airline').trim(),
    body('source').isString().trim(),
    body('destination').isString().trim()
], aircraftController.add)

router.get('/aircrafts', aircraftController.aircrafts)


module.exports = router