const ApiFeatures = require('./../util/queryHandler');

const Review = require('./../model/reviewModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/appError');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    let Query = Review.find();

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

exports.addReview = catchAsync(async (req, res, next) => {
    const user = req.user;

    const { review, rating, tour } = req.body;

    const newReview = await Review.create({
        user: user._id,
        review,
        rating,
        tour,
    });

    res.status(200).json({
        status: 'success',
        data: {
            newReview,
        },
    });
});
