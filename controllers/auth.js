const { validationResult } = require('express-validator');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.signup = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const error = new Error('Validation failed')
            error.statusCode = 422
            error.data = errors.array()
            throw error
        }
        const email = req.body.email;
        const name = req.body.name;
        const password = req.body.password;
        const hashedPwd = await bcrypt.hash(password, 12);

        const user = new User({
            email: email,
            name: name,
            password: hashedPwd
        });

        const result = await user.save();
        res.status(201).json({ message: 'User is Created', userId: result._id })
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error)
    }
}


exports.signin = async (req, res, next) => {
    try {
        const email = req.body.email
        const password = req.body.password
        console.log(email,password)
        let loadedUser
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('Email not found')
            error.statusCode = 401;
            throw error
        }
        loadedUser = user
        const isEqual = await bcrypt.compare(password, user.password)
        if (!isEqual) {
            const error = new Error('Password is wrong')
            error.statusCode = 401;
            throw error
        }
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
        }, 'somesupersuper', { expiresIn: '1h' });
        console.log(token)
        res.status(200).json({ token: token, userId: loadedUser._id.toString() })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500
        }
        next(err)
    }
}

