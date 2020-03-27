const express = require('express')
const { body } = require('express-validator')

const transactionController = require('../controllers/transaction')

const Airport = require('../models/airport')

const router = express.Router()

router.post('/addtransaction', [
    body('airport_id').trim().not().isEmpty()
        .custom(value => {
            return Airport.findOne({ _id: value })
                .then(airport => {
                    if (!airport) {
                        return Promise.reject('Airport not found')
                    }
                })
        }),
    body('quantity').isNumeric().trim().custom(value => {
        if (value <= 0) {
            return Promise.reject('Quantity should be greater then 0')
        }
        return Promise.resolve()
    }),
    body('transaction_type').trim().not().isEmpty()
        .custom(value => {
            if (!['IN', 'OUT'].includes(value)) {
                return Promise.reject('Not a valid transaction type')
            }
            return Promise.resolve()
        }),
], transactionController.addtransaction)


router.get('/transactions', transactionController.transactions)
router.delete('/deletetransactions', transactionController.deletetransactions)
router.post('/reversetransaction', transactionController.reversetransaction)
router.get('/getFuelSummary', transactionController.getFuelSummary)


module.exports = router