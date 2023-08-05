const router = require('express').Router({
    mergeParams: true,
});

const { protect, restrictTo } = require('../controller/authController');
const reviewController = require('./../controller/reviewController');

router.use(protect);

router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        restrictTo('user'),
        reviewController.setTourAndUserIds,
        reviewController.addReview
    );

router
    .route('/:id')
    .get(reviewController.getReviewById)
    .patch(restrictTo('user', 'admin'), reviewController.updateReview)
    .delete(restrictTo('user', 'admin'), reviewController.deleteReview);

module.exports = router;
