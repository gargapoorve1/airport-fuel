const { validationResult } = require('express-validator')

const Airport = require('../models/airport')

exports.add = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed')
            error.statusCode = 422
            error.data = errors.array()
            throw error;
        }
        const airport_name = req.body.airport_name
        const fuel_capacity = req.body.airport_capacity
        const fuel_available = fuel_capacity

        console.log("aaaaaa", airport_name, fuel_capacity, fuel_available)
        const airport = new Airport({
            airport_name: airport_name,
            fuel_capacity: fuel_capacity,
            fuel_available: fuel_available
        })
        const result = await airport.save()
        res.status(201).json({ message: 'Airport is added', airportId: result._id })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    }
}

exports.airports = async (req, res, next) => {
    try {
        const airports = await Airport.find()
            .sort({ airport_name: 1 })

        res.status(200).json({ message: "Airports fetched successfully", airports: airports })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    }
}