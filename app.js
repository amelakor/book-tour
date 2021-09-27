const express = require('express');
const morgan = require('morgan');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const path = require('path');

const AppError = require('./utils/appError');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewsRoutes');
const viewRouter = require('./routes/viewRoutes');

const globalErrorHandler = require('./controllers/errorController');

const app = express();

// global middlewares
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// set securiy HTTP headers
app.use(helmet());

if (process.env.NODE_env === 'development') {
    app.use(morgan('dev'));
}

//limit requests from the same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: "Too many requets from this IP, please try again in an hour" 
})

app.use('/app',limiter);

// body parser
app.use(express.json({ limit: '10kb'}));

//test middllware

app.use((req, res, next) => {
    req.requestYime = new Date().toISOString();
    next()
})

app.use('/', viewRouter);
app.use('/app/v1/tours', tourRouter);
app.use('/app/v1/users', userRouter);
app.use('/app/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app;
