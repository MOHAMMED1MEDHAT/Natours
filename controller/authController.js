const User = require('../model/userModel');
const catchAsync = require('./../util/catchAsync');

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);

    res.status(200).json({
        status: 'success',
        data: {
            user: newUser,
        },
    });
});
