const router = require('express').Router({
    mergeParams: true,
});

const { protect, restrictTo } = require('../controller/authController');
const reviewController = require('./../controller/reviewController');

router
    .route('/')
    .get(protect, reviewController.getAllReviews)
    .post(protect, restrictTo('user'), reviewController.addReview);

router.get('/:id', protect, reviewController.getReviewById);

module.exports = router;
