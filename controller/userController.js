const multer = require('multer');

const Bookings = require('./../model/bookingModel');
const Tour = require('./../model/tourModel');
const User = require('./../model/userModel');
const catchAsync = require('./../util/catchAsync');
const AppError = require('./../util/appError');
const factory = require('./handlerFactory');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image try to upload an image', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(600, 600)
        .toFormat('jpeg')
        .jpeg({ quality: 95 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
});

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

    // console.log('body', req.file, req.body);

    const filteredObj = filterObj(req.body, 'name', 'email');
    if (req.file) {
        filterObj.photo = req.file.filename;
    }
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredObj, {
        new: true,
        runValidators: true,
    });

    // console.log(updatedUser);

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});

exports.getMe = (req, res, next) => {
    req.params.id = req.user._id;
    next();
};

exports.deleteMe = catchAsync(async (req, res) => {
    await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
    const bookings = await Bookings.find({ user: req.user.id });

    const tourIDs = bookings.map((elm) => elm.tour);

    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).json({
        status: 'success',
        data: {
            tours,
        },
    });
});

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.createUser = factory.createOne(User);

//don't update the user password using this route
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
