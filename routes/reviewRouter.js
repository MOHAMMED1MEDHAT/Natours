const router = require('express').Router({
    mergeParams: true,
});

const { protect, restrictTo } = require('../controller/authController');
const reviewController = require('./../controller/reviewController');

router
    .route('/')
    .get(protect, reviewController.getAllReviews)
    .post(protect, restrictTo('user'), reviewController.addReview);

router
    .route('/:id')
    .get(protect, reviewController.getReviewById)
    .delete(protect, reviewController.deleteReview);

module.exports = router;
