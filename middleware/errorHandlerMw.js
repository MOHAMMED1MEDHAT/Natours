module.exports = (err, res) => {
    res.status(500).json({
        status: 'fail',
        errorMassage: { err },
    });
};
