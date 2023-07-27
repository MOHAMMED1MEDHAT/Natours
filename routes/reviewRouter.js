const router = require('express').Router();

const { protect } = require('../controller/authController');
const reviewController = require('./../controller/reviewController');

router
    .route('/')
    .get(protect, reviewController.getAllReviews)
    .post(protect, reviewController.addReview);

router.get('/:id', protect, reviewController.getReviewById);

module.exports = router;
