const { validationResult } = require('express-validator')

const Airport = require('../models/airport')
const Aircraft = require('../models/aircraft')
const Transaction = require('../models/transaction')


exports.addtransaction = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed')
            error.statusCode = 422
            error.data = errors.array()
            throw error;
        }
        const transaction_type = req.body.transaction_type
        const quantity = req.body.quantity
        const airport_id = req.body.airport_id
        const airport = await Airport.findOne({ _id: airport_id })
        if (!airport) {
            const error = new Error('Airport not found')
            error.statusCode = 404
            throw error;
        }
        const airport_capacity = airport.fuel_capacity
        const airport_fuel_available = airport.fuel_available
        if (transaction_type === 'IN') {
            const available_refill_capacity = airport_capacity - airport_fuel_available
            if (available_refill_capacity < quantity) {
                const error = new Error('Cannot refill fuel at this airport')
                error.statusCode = 404
                throw error;
            }
            const new_fuel_available = Number(airport_fuel_available) + Number(quantity)
            const transaction = new Transaction({
                transaction_date_time: new Date().toISOString(),
                transaction_type: transaction_type,
                quantity: quantity,
                airport_id: airport_id,
            })
            await transaction.save()
            await Airport.findByIdAndUpdate(airport_id, { fuel_available: String(new_fuel_available) })
            res.status(200).json({ message: 'Transaction created successfully' })
        }
        if (transaction_type === 'OUT') {
            const aircraft_id = req.body.aircraft_id
            if (!aircraft_id) {
                const error = new Error('Aircraft ID is required')
                error.statusCode = 404
                throw error;
            }
            const aircraft = await Aircraft.findOne({ _id: aircraft_id })
            if (!aircraft) {
                const error = new Error('Aircraft not found')
                error.statusCode = 404
                throw error;
            }
            if (airport_fuel_available < quantity || quantity > airport_capacity) {
                const error = new Error('Fuel is unavailable')
                error.statusCode = 404
                throw error;
            }
            const new_fuel_available = Number(airport_fuel_available) - Number(quantity)
            const transaction = new Transaction({
                transaction_date_time: new Date().toISOString(),
                transaction_type: transaction_type,
                quantity: quantity,
                airport_id: airport_id,
                aircraft_id: aircraft_id
            })
            await transaction.save()
            await Airport.findByIdAndUpdate(airport_id, { fuel_available: String(new_fuel_available) })
            res.status(200).json({ message: 'Transaction created successfully' })
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    }
}


exports.transactions = async (req, res, next) => {
    try {
        const transactions = await Transaction.find()
            .populate('airport_id')
            .populate('aircraft_id')
            .sort({ transaction_date_time: -1 })

        res.status(200).json({ message: "Transactions fetched successfully", transactions: transactions })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    }
}

exports.deletetransactions = async (req, res, next) => {
    try {
        await Transaction.remove()
        res.status(200).json({ message: "Transactions deleted successfully" })

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    }
}


exports.reversetransaction = async (req, res, next) => {
    try {
        const _id = req.body._id
        const transaction = await Transaction.findOne({ _id: _id })
        if (!transaction) {
            const error = new Error('Transaction not found')
            error.statusCode = 404
            throw error;
        }
        const transaction_type = transaction.transaction_type
        const quantity = transaction.quantity
        const airport_id = transaction.airport_id
        const aircraft_id = transaction.aircraft_id
        const airport = await Airport.findOne({ _id: airport_id })
        if (!airport) {
            const error = new Error('Airport not found')
            error.statusCode = 404
            throw error;
        }
        const airport_capacity = airport.fuel_capacity
        const airport_fuel_available = airport.fuel_available
        if (transaction_type === 'IN') {
            if (airport_fuel_available < quantity) {
                const error = new Error('Sorry!! Transaction cannot be reversed')
                error.statusCode = 404
                throw error;
            }
            const new_reverse_fuel_in = airport_fuel_available - quantity
            await Airport.findByIdAndUpdate(airport_id, { fuel_available: String(new_reverse_fuel_in) })
            const transaction = new Transaction({
                transaction_date_time: new Date().toISOString(),
                transaction_type: "REVERSE IN-OUT",
                quantity: quantity,
                airport_id: airport_id,
                transaction_parent_id: _id
            })
            await transaction.save()
            res.status(200).json({ message: "Transactions reversed successfully" })
        }
        if (transaction_type === 'OUT') {
            const new_reverse_fuel_out = airport_fuel_available + quantity
            if (new_reverse_fuel_out > airport_capacity) {
                const error = new Error('Sorry!! Transaction cannot be reversed')
                error.statusCode = 404
                throw error;
            }
            await Airport.findByIdAndUpdate(airport_id, { fuel_available: String(new_reverse_fuel_out) })
            const transaction = new Transaction({
                transaction_date_time: new Date().toISOString(),
                transaction_type: "REVERSE OUT-IN",
                quantity: quantity,
                airport_id: airport_id,
                aircraft_id: aircraft_id,
                transaction_parent_id: _id
            })
            await transaction.save()
            res.status(200).json({ message: "Transactions reversed successfully" })
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    }
}


exports.getFuelSummary = async (req, res, next) => {
    try {
        Transaction.aggregate([
            {
                "$lookup": {
                    "from": "aircrafts",
                    "localField": "aircraft_id",
                    "foreignField": "_id",
                    "as": "aircraft"
                }
            },
            {
                "$group": {
                    _id: "$airport_id",
                    "transactions": {
                        $push: "$$ROOT"
                    }
                }
            },
            {
                "$lookup": {
                    "from": "airports",
                    "localField": "_id",
                    "foreignField": "_id",
                    "as": "airport"
                }
            },
        ], (err, result) => {
            if (err) {
                const error = new Error('Something went wrong')
                error.statusCode = 400
                throw error;
            }
            res.status(200).json({ message: "Fuel consumption report", result: result })
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err);
    }
}