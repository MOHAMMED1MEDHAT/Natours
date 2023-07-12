const User = require('../model/userModel');
const catchAsync = require('./../util/catchAsync');
const AppError = require('./../util/appError');

const { promisify } = require('util');
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

    const token = jwt.sign(
        {
            userId: user._id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );

    res.status(200).json({
        status: 'success',
        token,
        data: {},
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    //check if token exist
    let token = '';
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(
            new AppError(
                'you are not logged in please login to get access',
                401
            )
        );
    }
    //verify token
    const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    //check if user still exist
    const user = await User.findById(payload.userId);
    if (!user) {
        return next(
            new AppError('the user with this token does not exist', 401)
        );
    }
    //check if user changed password after token was issued
    if (user.changedPasswordAfter(payload.iat)) {
        return next(
            new AppError('User Recently changed password Please Login again'),
            401
        );
    }
    //grant access to protected route
    next();
});
