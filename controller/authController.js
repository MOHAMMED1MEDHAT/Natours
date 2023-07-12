const User = require('../model/userModel');
const catchAsync = require('./../util/catchAsync');

const jwt = require('jsonwebtoken');

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm } = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm,
    });

    const token = jwt.sign(
        {
            userId: newUser._id,
        },
        process.env.JWT_SECRET
    );

    res.status(200).json({
        status: 'success',
        data: {
            user: newUser,
        },
    });
});
