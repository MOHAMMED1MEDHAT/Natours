const AuthUser = require('./../controller/authController');

const router = require('express').Router();

const User = require('./../controller/userController');

router.post('/signup', AuthUser.signup);
router.post('/login', AuthUser.login);

router.post('/forgetPassword', AuthUser.forgetPassword);
router.patch('/resetPassword/:token', AuthUser.resetPassword);

router.patch('/updateMyPassword', AuthUser.protect, AuthUser.updatePassword);

router.route('/').get(User.getAllUsers).post(User.createUser);

router
    .route('/:id')
    .get(User.getUser)
    .patch(User.updateUser)
    .delete(User.deleteUser);

module.exports = router;
