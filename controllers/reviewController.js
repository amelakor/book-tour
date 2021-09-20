const AppError = require('../utils/appError');
const Review = require('./../models/reviewModel');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, res, next) => {
    const reviews = await Review.find();

    if(!reviews) return next(new AppError('There is no reviews, plese try again'), 400)

    res.status(200).json({
        status: 'success',
        data: {
            reviews
        }
    })
})

exports.createReview = catchAsync(async(req, res, next) => {
    const newReview = await Review.create(req.body);

    if(!newReview) return next(new AppError('There are some errors, plese review them.'), 400)

    res.status(201).json({
        status: 'success',
        data: {
            review: newReview
        }
    })
})