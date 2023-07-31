const router = require('express').Router();

const authController = require('./../controller/authController');
const Tours = require('../controller/tourController');
const Reviews = require('../controller/reviewController');

router
    .route('/')
    .get(authController.protect, Tours.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        Tours.addTour
    );

router
    .route('/:tourId/reviews')
    .post(
        authController.protect,
        authController.restrictTo('user'),
        Reviews.addReview
    )
    .get(Reviews.getAllReviews);

router.get('/:tourId/reviews/:reviewId', Reviews.getReviewById);

router
    .route('/:id')
    .get(Tours.getTourById)
    .patch(Tours.updateTourById)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        Tours.deleteTourById
    );

// router.get('/', Tours.getAllTours);

router.get('/tour-stats', Tours.getTourStats);

// router.get('/plan/:year', Tours.getToursMonth);

router.get('/top-5-cheap', Tours.aliasTopTour, Tours.getAllTours);

router.get('/monthly-plan/:year', Tours.getMonthPlan);

// router.get('/:id', Tours.getTourById);

// router.post('/', Tours.addTour);

// router.patch('/:id', Tours.updateTourById);

// router.delete('/:id', Tours.deleteTourById);

module.exports = router;
