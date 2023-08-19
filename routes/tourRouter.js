const router = require('express').Router();

const authController = require('./../controller/authController');
const Tours = require('../controller/tourController');
const reviewRouter = require('./reviewRouter');

router
    .route('/')
    .get(Tours.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        Tours.addTour
    );

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(Tours.getTourWithin);

router.use('/:tourId/reviews', reviewRouter);

router
    .route('/:id')
    .get(Tours.getTourById)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        Tours.updateTourById
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        Tours.deleteTourById
    );

// router.get('/', Tours.getAllTours);

router.get('/tour-stats', Tours.getTourStats);

// router.get('/plan/:year', Tours.getToursMonth);

router.get('/top-5-cheap', Tours.aliasTopTour, Tours.getAllTours);

router.get(
    '/monthly-plan/:year',
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    Tours.getMonthPlan
);

module.exports = router;
