const AuthUser = require('./../controller/authController');

const multer = require('multer');
const router = require('express').Router();

const User = require('./../controller/userController');

const upload = multer({ dest: 'public/img/users' });

router.post('/signup', AuthUser.signup);
router.post('/login', AuthUser.login);
router.post('/forgetPassword', AuthUser.forgetPassword);
router.patch('/resetPassword/:token', AuthUser.resetPassword);

router.use(AuthUser.protect);

router.patch('/updateMyPassword', AuthUser.updatePassword);

router.patch('/updateMe', User.uploadUserPhoto, User.updateMe);

router.get('/me', User.getMe, User.getUser);

router.delete('/deleteMe', AuthUser.restrictTo('admin'), User.deleteMe);

router.use(AuthUser.restrictTo('admin'));

router.route('/').get(User.getAllUsers).post(User.createUser);

router
    .route('/:id')
    .get(User.getUser)
    .patch(User.updateUser)
    .delete(User.deleteUser);

module.exports = router;
