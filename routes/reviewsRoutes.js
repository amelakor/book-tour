const express = require('express');
const reviewContoller = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({mergeParams: true});

router.route('/').get(reviewContoller.getAllReviews);
router.route('/create-review').post(authController.protect, authController.restrictTo('user'), reviewContoller.setTourAndUsersIds,reviewContoller.createReview);
router.route('/:id').get(reviewContoller.getReview).patch(authController.restrictTo('user', 'admin'),reviewContoller.updateReview).delete(authController.restrictTo('user', 'admin'), reviewContoller.deleteReview);

module.exports = router;