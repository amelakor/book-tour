const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxLength: [40, 'A tour name must have less or equal 40 characters'],
        minLength: [5, 'A tour name must have more or equal 5 characters'],
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a maximum group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Possible values are easy, medium, or difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1'],
        max: [5, 'Rating must be below 5']
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a name']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                return val < this.price;
            },
            message: ' Discount must be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    desctiption: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        // geoJSON
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ]
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

tourSchema.index({price: 1})
tourSchema.index({slug: 1})

tourSchema.virtual('durationWeekes').get(function () {
    return this.duration / 7;
})

// virtual populate
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})

//document middlevare, runs before sve comanda and.create comand
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {
        lower: true
    })
    next();
})

//embedding users to tours
// tourSchema.pre('save', async function(next) {
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     console.log(guidesPromises)
//     this.guides = await Promise.all(guidesPromises);
//     next()
// })

// query middlvare
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } })
    next()
})

tourSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'guides',
        select: '-v -passwordChangedAt'
    })
    next()
})

//aggregation middlevare
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({
        $match: { secretTour: { $ne: true } }
    })
    console.log(this)
    next()
})

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;