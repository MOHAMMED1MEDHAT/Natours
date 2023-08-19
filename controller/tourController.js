const Tour = require('../model/tourModel');
const AppError = require('../util/appError');
const catchAsync = require('./../util/catchAsync');
const factory = require('./handlerFactory');

exports.getAllTours = factory.getAll(Tour);

exports.aliasTopTour = catchAsync(async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAvarage,price';
    req.query.fields = 'name,price,ratingsAvarage,summary';
});

exports.getTourById = factory.getOne(Tour, { path: 'reviews' });

exports.addTour = factory.createOne(Tour);

exports.updateTourById = factory.updateOne(Tour);

exports.deleteTourById = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            //to apply a query
            $match: {
                ratingsAverage: { $gte: 4.5 },
            },
        },
        {
            $group: {
                _id: '$difficulty',
                numTours: { $sum: 1 },
                ratingNum: { $sum: '$ratingsQuantity' },
                avgRating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
    ]);

    res.status(200).json({ stats: 'success', data: { stats } });
});

exports.getMonthPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;

    const stats = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            //to apply a query
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-1`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTours: { $sum: 1 },
                toursOfMonth: { $push: '$name' },
            },
        },
    ]);

    res.status(200).json({ stats: 'success', data: { stats } });
});

exports.getTourWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;

    const [lat, lng] = latlng.split(',');

    if (!lat || !lng) {
        next(new AppError('please provide a vaild coordinates', 400));
    }

    const raduis = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerShpere: [[lng, lat], raduis] } },
    });

    res.status(200).json({
        message: 'success',
        results: tours.length,
        data: {
            data: tours,
        },
    });
});
