const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const airportSchema = new Schema({
    airport_name: {
        type: String,
        required: true
    },
    fuel_capacity: {
        type: Number,
        required: true
    },
    fuel_available: {
        type: Number
    }
}, { timestamps: true })

module.exports = mongoose.model('Airport', airportSchema)