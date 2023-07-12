// 'use strict';

// const fs = require('fs');

const morgan = require('morgan');
const express = require('express');

const globalErrorHandler = require('./controller/errorController');

const app = express();
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.static(`${__dirname}/public`));

//routes
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRoutes');

app.use('/api/v1/tour', tourRouter);
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
