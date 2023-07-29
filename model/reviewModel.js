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

module.exports = mongoose.model('review', reviewSchema);
