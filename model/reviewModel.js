const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    author: {
        type: mongoose.Types.ObjectId,
        ref: 'user',
    },
    tour: {
        type: mongoose.Types.ObjectId,
        ref: 'tour',
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
});

module.exports = mongoose.model('review', reviewSchema);
