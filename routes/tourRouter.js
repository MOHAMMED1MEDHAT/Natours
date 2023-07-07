const router = require('express').Router();

const Tours = require('../controller/tourController');

router.route('/').get(Tours.getAllTours).post(Tours.addTour);

router
    .route('/:id')
    .get(Tours.getTourById)
    .patch(Tours.updateTourById)
    .delete(Tours.deleteTourById);

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
