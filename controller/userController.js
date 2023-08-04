const User = require('./../model/userModel');
const catchAsync = require('./../util/catchAsync');
const AppError = require('./../util/appError');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedAtt) => {
    const newObj = {};
    for (att in obj) {
        if (allowedAtt.includes(att)) {
            newObj[att] = obj[att];
        }
    }
    return newObj;
};

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

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

//don't update the user password using this route
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
