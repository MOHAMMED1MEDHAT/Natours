const User = require('./../model/userModel');
const catchAsync = require('./../util/catchAsync');
const AppError = require('./../util/appError');

const filterObj = (obj, ...allowedAtt) => {
    const newObj = {};
    for (att in obj) {
        if (allowedAtt.includes(att)) {
            newObj[att] = obj[att];
        }
    }
    return newObj;
};

exports.getAllUsers = catchAsync(async (req, res) => {
    const users = await User.find();

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users,
        },
    });
});

exports.updateMe = catchAsync(async (req, res) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'this route is not for changeing password use /updateMyPassword',
                400
            )
        );
    }

    const filteredObj = filterObj(req.body, 'name', 'email');
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

exports.deleteMe = catchAsync(async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getUser = catchAsync(async (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined!',
    });
});
// exports.createUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined!',
//     });
// };
// exports.updateUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined!',
//     });
// };
// exports.deleteUser = (req, res) => {
//     res.status(500).json({
//         status: 'error',
//         message: 'This route is not yet defined!',
//     });
// };
