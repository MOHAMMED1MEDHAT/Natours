const Review = require('./../model/reviewModel');
const catchAsync = require('../util/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);

exports.getReviewById = factory.getOne(Review);

exports.setTourAndUserIds = (req, res, next) => {
    //To Allow for Nested Routes
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.author) req.body.author = req.user._id;

    next();
};

exports.addReview = factory.createOne(Review);

exports.updateReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
