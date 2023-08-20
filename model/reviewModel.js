const Tour = require('./tourModel');

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: [true, 'a review must have an author'],
        },
        tour: {
            type: mongoose.Types.ObjectId,
            ref: 'Tour',
            required: [true, 'a review must have a tour'],
        },
        review: {
            type: String,
            required: [true, 'Can not have no review'],
        },
        rating: {
            type: Number,
            min: [1, 'no less than one'],
            max: [5, 'no more than five'],
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

reviewSchema.index({ tour: 1, author: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'author',
        select: 'name photo',
    }).populate({
        path: 'tour',
        select: 'name',
    });
    next();
});

reviewSchema.statics.calcAverageRating = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);
    // console.log(stats);
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};

reviewSchema.post('save', function () {
    this.constructor.calcAverageRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
    this.ReviewInstance = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    await this.ReviewInstance.constructor.calcAverageRating(
        this.ReviewInstance.tour
    );
});

module.exports = mongoose.model('review', reviewSchema);
