const express = require('express');
const reviewContoller = require('./../controllers/reviewController');

const router = express.Router();

router.route('/').get(reviewContoller.getAllReviews);
router.route('/create-review').post(reviewContoller.createReview);

module.exports = router;