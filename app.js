const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes')

const app = express();

// middlewares
if (process.env.NODE_env === 'development') {
    app.use(morgan('dev'));
}

app.use(express.json());


module.exports = app;

app.use((req, res, next) => {
    req.requestYime = new Date().toISOString();
    next()
})

app.use('/app/v1/tours', tourRouter);
app.use('/app/v1/users', userRouter);
