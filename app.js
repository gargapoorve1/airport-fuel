const express = require('express')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const airportRoutes = require('./routes/airport');
const aircraftRoutes = require('./routes/aircraft');
const transactionRoutes = require('./routes/transaction');


const app = express();
const port = process.env.PORT || 8000

app.use(bodyParser.json())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
})

app.use('/auth', authRoutes)
app.use('/airport', airportRoutes)
app.use('/aircraft', aircraftRoutes)
app.use('/transaction', transactionRoutes)

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose.connect('mongodb://localhost/airport-authority')
    .then(res => app.listen(port))
    .catch(err => console.log(err))