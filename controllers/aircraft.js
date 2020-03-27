const { validationResult } = require('express-validator')

const Aircraft = require('../models/aircraft')

exports.add = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed')
            error.statusCode = 422
            error.data = errors.array()
            throw error;
        }
        const airline_no = req.body.airline_no
        const airline = req.body.airline
        const source = req.body.source
        const destination = req.body.destination

        const aircraft = new Aircraft({
            airline_no: airline_no,
            airline: airline,
            source: source,
            destination: destination
        })
        const result = await aircraft.save()
        res.status(201).json({ message: 'Aircraft is added', aircraftId: result._id })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    }
}

exports.aircrafts = async (req, res, next) => {
    try {
        const aircrafts = await Aircraft.find()
            .sort({ airline_no: 1 })

        res.status(200).json({ message: "Aircrafts fetched successfully", aircrafts: aircrafts })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    }
}