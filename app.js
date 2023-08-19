// 'use strict';

// const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
const multer = require('multer');
const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const expressMongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const globalErrorHandler = require('./controller/errorController');

const upload = multer({ dest: 'public/img/users' });

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//middeleware
app.use(helmet());

const limit = rateLimit({
    max: 120,
    windowMs: 60 * 60 * 1000,
    message: 'Too many request from this IP, please try again in an hour',
});
app.use('/api', limit);
//TODO:enable on delivery
// if (process.env.NODE_ENV === 'development') {
//     app.use(morgan('dev'));
// }
//TODO:delete on delivery
app.use(morgan('dev'));

app.use(express.json({ limit: '16kb' }));

app.use(expressMongoSanitize());

app.use(xss());

app.use(
    hpp({
        whitelist: [
            'duration',
            'price',
            'maxGroupSize',
            'ratingsAverage',
            'ratingsQuantity',
            'difficulty',
        ],
    })
);

// app.use(express.static(`${__dirname}/public`));

//routes
const tourRouter = require('./routes/tourRouter');
const reviewRouter = require('./routes/reviewRouter');
const userRouter = require('./routes/userRoutes');

app.get('/', (req, res) => {
    res.status(200).render('base');
});

app.use('/api/v1/tour', tourRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `can't find ${req.originalUrl} on this server`,
    });
});

//errorHandlerMw
app.use(globalErrorHandler);

module.exports = app;
