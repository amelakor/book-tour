const express = require('express');
const tourContoller = require('./../controllers/tourContoller');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewsRoutes');

const router = express.Router();


// router.route('/:tourId/reviews').post(authController.protect, authController.restrictTo('user'), reviewController.createReview)

router.use('/:tourId/reviews', reviewRouter);


// router.param('id', tourContoller.checkID);
router.route('/top-five').get(tourContoller.aliasTopTours, tourContoller.getAllTours);
router.route('/tour-stats').get(tourContoller.getTourStats);
router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourContoller.getmonthlyPlan);

router.route('/')
    .get(tourContoller.getAllTours)
    .post(authController.protect,authController
    .restrictTo('admin', 'lead-guide'), tourContoller.createTour);
router.route('/:id')
    .get(tourContoller.getTour)
    .patch(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourContoller.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourContoller.deleteTour);

module.exports = router;