const ApiFeatures = require('./../util/queryHandler');

const Review = require('./../model/reviewModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let tourQuery = {};
    if (req.params.tourId) tourQuery.tour = req.params.tourId;

    let Query = Review.find(tourQuery);

    const APIfeaturesObj = new ApiFeatures(Query, req.query)
        .filter()
        .sort()
        .project()
        .pagination();

    const reviews = await APIfeaturesObj.MongooseQuery;

    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: { reviews },
    });
});

exports.getReviewById = catchAsync(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if (!review) {
        return next(new AppError('this id does not exist', 400));
    }

    res.status(200).json({
        status: 'success',
        data: {
            review,
        },
    });
});

exports.setTourAndUserIds = (req, res, next) => {
    //To Allow for Nested Routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.author) req.body.author = req.user._id;

    next();
};

exports.addReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
