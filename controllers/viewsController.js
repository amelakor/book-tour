const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync')

exports.getOverview = catchAsync(async (req, res) => {
    //get tour data from collection
    const tours = await Tour.find();
    console.log(tours)

    // build template

    // render that template using tour data
    res.status(200).render('overview', {
        title: 'All tours',
        tours
    })
})

exports.getTour = (req, res) => {
    res.status(200).render('tour', {
        title: 'The forest hiker'
    })
}