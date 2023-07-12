const User = require('../model/userModel');
const catchAsync = require('./../util/catchAsync');
const AppError = require('./../util/appError');

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
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );

    res.status(200).json({
        status: 'success',
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('please provide email and password', 400));
    }

    const user = await User.findOne({ email }).exec();

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect Email Or Password', 401));
    }

    const token = '';

    res.status(200).json({
        status: 'success',
        token,
        data: {},
    });
});
