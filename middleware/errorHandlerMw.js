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
        sendErrorProd(err, res);
    }
};
