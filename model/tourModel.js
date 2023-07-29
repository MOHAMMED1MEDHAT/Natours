const mongoose = require('mongoose');

const TourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a name'],
            unique: true,
            maxlength: [50, 'no more than 50 characters are accepted'],
            minlength: [5, 'no less than 5 characters are accepted'],
            validate: {
                validator: function (value) {
                    return !/\d+/.test(value);
                },
                message: '({VALUE}) have digits',
            },
        },
        duration: {
            type: Number,
            required: [true, 'A tour must have a durations'],
        },
        maxGroupSize: {
            type: Number,
            required: [true, 'A tour must have a group size'],
        },
        difficulty: {
            type: String,
            enum: {
                values: ['easy', 'medium', 'difficult'],
                message: 'not an accepted difficulty',
            },
            required: [true, 'A tour must have a difficulty'],
        },
        ratingsAverage: {
            type: Number,
            min: [1, 'rating must be above 1'],
            default: 4.5,
        },
        ratingsQuantity: {
            type: Number,
            default: 0,
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price'],
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (value) {
                    console.log(this);
                    return value < this.price;
                },
                message:
                    'dicount price ({VALUE}) should be blow the regular price',
            },
        },
        summary: {
            type: String,
            trim: true,
            required: [true, 'A tour must have a summary'],
        },
        discription: {
            type: String,
            trim: true,
        },
        imageCover: {
            type: String,
            required: [true, 'A tour must have a imageCover'],
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false,
        },
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point'],
            },
            coordinates: [Number],
            address: String,
            description: String,
        },
        guides: [
            {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
            },
        ],
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point'],
                },
                coordinates: [Number],
                address: String,
                description: String,
                day: Number,
            },
        ],
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

TourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

TourSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

// TourSchema.pre('save', function (next) {
//     this.name = this.name + 'mohammed';
//     next();
// });

// TourSchema.post('save', function (doc, next) {
//     console.log(doc);
//     next();
// });

TourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: { $ne: true } });
    this.start = Date.now();
    next();
});

TourSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'guides',
        select: '-__v -passwordChangedAt',
    });
    next();
});

TourSchema.post(/^find/, function (doc, next) {
    console.log(`Query time:${Date.now() - this.start}ms`);
    next();
});

TourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

module.exports = mongoose.model('Tour', TourSchema);
