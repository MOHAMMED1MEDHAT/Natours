const User = require('../model/userModel');
const catchAsync = require('./../util/catchAsync');
const AppError = require('./../util/appError');
const sendEmail = require('./../util/email');

const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const createAndSendJWT = (user, stausCode, res) => {
    const JWTToken = jwt.sign(
        {
            userId: user._id,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    if (process.env.NODE_ENV === 'production') {
        cookieOptions.secure = true;
    }

    res.cookie('jwt', token, cookieOptions);

    user.password = undefined;

    res.status(stausCode).json({
        status: 'success',
        token: JWTToken,
        data: {
            user,
        },
    });
};

exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm } = req.body;
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm,
    });
    createAndSendJWT(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('please provide email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password').exec();

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect Email Or Password', 401));
    }
    createAndSendJWT(user, 200, res);
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
    req.user = user;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            next(new AppError('You do not have permission', 403));
        }
        next();
    };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
    //get user based on posted email
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        next(new AppError('User Not found'), 404);
    }
    //generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({
        validateBeforeSave: false,
    });

    //send it to user's email\
    const resetURL = `${req.protocol}://${req.get(
        'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message,
        });
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!',
        });
    } catch (err) {
        console.log(err);
        user.passwordResetToken = undefined;
        user.passwordResetExpire = undefined;
        await user.save({
            validateBeforeSave: false,
        });
        return next(
            new AppError(
                'There was an error sending the email. Try again later!'
            ),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
    //get user based on resetToken
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpire: { $gt: Date.now() },
    });

    //if token has not expired and there is user set new password
    if (!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    //update changedPasswordAt property for the user
    //log the user in send jwt

    createAndSendJWT(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('+password');

    if (
        !(await user.correctPassword(req.body.passwordCurrent, user.password))
    ) {
        return next(new AppError('your current password is not this', 401));
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    createAndSendJWT(user, 200, res);
});
