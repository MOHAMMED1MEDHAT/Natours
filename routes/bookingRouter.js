const router = require('express').Router();

const { protect, restrictTo } = require('../controller/authController');
const bookingController = require('./../controller/bookingController');

router.get(
    '/checkout-session/:tourID',
    protect,
    bookingController.getCheckoutSession
);

module.exports = router;
