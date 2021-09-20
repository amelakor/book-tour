const express = require('express');
const tourContoller = require('./../controllers/tourContoller');
const authController = require('./../controllers/authController');

const router = express.Router();

// router.param('id', tourContoller.checkID);
router.route('/top-five').get(tourContoller.aliasTopTours, tourContoller.getAllTours);
router.route('/tour-stats').get(tourContoller.getTourStats);
router.route('/monthly-plan/:year').get(tourContoller.getmonthlyPlan);
router.route('/').get(authController.protect,tourContoller.getAllTours).post(tourContoller.createTour);
router.route('/:id').get(tourContoller.getTour).patch(tourContoller.updateTour).delete(authController.protect,authController.restrictTo('admin', 'lead-guide'), tourContoller.deleteTour);

module.exports = router;