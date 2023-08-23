const router = require('express').Router();

const { protect, restrictTo } = require('../controller/authController');
const bookingController = require('./../controller/bookingController');

router.use(protect);

router.get('/checkout-session/:tourID', bookingController.getCheckoutSession);

router.use(restrictTo('admin', 'lead-guide'));

router
    .route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking);

router
    .route('/:id')
    .get(bookingController.getBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;
