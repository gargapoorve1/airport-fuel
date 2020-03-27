const express = require('express')
const { body } = require('express-validator');

const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.post('/signup', [
    body('email')
        .isEmail()
        .custom(value => {
            return User.findOne({ email: value })
                .then(user => {
                    if (user) {
                        return Promise.reject('Email address already exists')
                    }
                })
        }),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty()
], authController.signup);

router.post('/signin', authController.signin);


module.exports = router