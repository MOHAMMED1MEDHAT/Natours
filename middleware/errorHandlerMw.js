const AppError = require('./../util/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value`;
    return new AppError(message, 400);
};

sendErrorDev = (err, res) => {
    res.status(500).json({
        status: 'fail',
        errorMassage: { err },
    });
};

sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: 'fail',
            errorMassage: { err },
        });
    } else {
        res.status(500).json({
            status: 'fail',
            errorMassage: 'Something went wrong',
        });
    }
};

module.exports = (err, res) => {
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 1100) error = handleDuplicateFieldsDB(error);
        sendErrorProd(error, res);
    }
};
