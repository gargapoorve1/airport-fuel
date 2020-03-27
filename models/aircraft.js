const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const aircraftSchema = new Schema({
    airline: {
        type: String,
        required: true
    },
    airline_no: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Aircraft', aircraftSchema)