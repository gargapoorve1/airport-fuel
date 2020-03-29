const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    transaction_date_time: {
        type: Date,
        default: Date.now
    },
    transaction_type: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    transaction_parent_id: {
        type: String
    },
    airport_id: {
        type: Schema.Types.ObjectId,
        ref: 'Airport',
        required: true
    },
    aircraft_id: {
        type: Schema.Types.ObjectId,
        ref: 'Aircraft'
    }
}, { timestamps: true })

module.exports = mongoose.model('Transaction', transactionSchema)