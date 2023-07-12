const APIfeaturs = require('./../util/queryHandler');
const Tour = require('../model/tourModel');
const catchAsync = require('./../util/catchAsync');
const AppError = require('./../util/appError');

exports.getAllTours = catchAsync(async (req, res, next) => {
    //1-Build the query

    // //A:recieve the queryObj
    // let queryObj = { ...req.query });
    // let options = {});
    // const excludeFields = ['page', 'sort', 'fields', 'limit'];
    // console.log(queryObj);

    // //A.1:make it advanced (use condition) query
    // queryObj = JSON.parse(
    //     JSON.stringify(queryObj).replace(
    //         /\b(gte|gt|lt|lte)\b/g,
    //         (match) => `$${match}`
    //     )
    // );

    // //excludeFields and make options for sorting and pagination
    // excludeFields.map((elm) => {
    //     options[elm] = queryObj[elm];
    //     delete queryObj[elm];
    // });

    // //A.2:make the options more relevat
    // options = JSON.parse(JSON.stringify(options).replace(/\b(,)\b/g, ' '));

    // console.log(options);

    //B: make the query.prototype
    let Query = Tour.find();

    const APIfeaturesObj = new APIfeaturs(Query, req.query)
        .filter()
        .sort()
        .project()
        .pagination();

    //B.2.1:chain sorting
    // if (req.query.sort) {
    //     query = query.sort(options.sort);
    // } else {
    //     //default sort
    //     query = query.sort('-createdAt');
    // }
    //B.2.2:chain fields projection limiting
    // if (req.query.fields) {
    //     query = query.select(`-_id ${options.fields}`);
    // } else {
    //     //default sort
    //     query = query.select('-__v -_id');
    // }
    //B.2.3:chain pagination
    // const page = options.page * 1 || 1;
    // const limit = options.limit * 1 || 1;
    // const skip = (page - 1) * limit;
    // query = query.skip(skip).limit(limit);
    // if (req.query.page) {
    //     const numTour = await Tour.countDocuments();
    //     if (skip >= numTour) {
    //         throw new Error('this page does not exist');
    //     }
    // }

    //2-Excute the query
    const tours = await APIfeaturesObj.MongooseQuery;

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: { tours },
    });
});

exports.aliasTopTour = catchAsync(async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAvarage,price';
    req.query.fields = 'name,price,ratingsAvarage,summary';
});

exports.getTourById = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).select('-_id -__v').exec();

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { tour },
    });
});

exports.addTour = catchAsync(async (req, res, next) => {
    const {
        name,
        duration,
        maxGroupSize,
        difficulty,
        ratingsAverage,
        ratingsQuantity,
        price,
        priceDiscount,
        summary,
        discription,
        imageCover,
        images,
        createdAt,
        startDates,
        secretTour,
    } = req.body;

    const newTour = await Tour.create({
        name,
        duration,
        maxGroupSize,
        difficulty,
        ratingsAverage,
        ratingsQuantity,
        price,
        priceDiscount,
        summary,
        discription,
        imageCover,
        images,
        createdAt,
        startDates,
        secretTour,
    });
    res.status(200).json({
        status: 'success',
        data: { newTour },
    });
});

exports.updateTourById = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { runValidators: true, new: true }
    );

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(201).json({
        status: 'success',
        data: { tour },
    });
});

exports.deleteTourById = catchAsync(async (req, res, next) => {
    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
        return next(new AppError('No tour found with that ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null,
    });
});

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
