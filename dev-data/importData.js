require('dotenv').config({ path: './config.env' });
const fs = require('fs');
const Tour = require('./../model/tourModel');
const Review = require('./../model/reviewModel');
const User = require('./../model/userModel');
const mongoose = require('mongoose');

mongoose
    .connect(process.env.ATLAS_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'Natours',
    })
    .then(() => {
        console.log('Connected to db');
    })
    .catch((err) => console.log('error occured' + err));

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/data/tours.json`, 'utf-8')
);

const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('added all');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('deleted all');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

const reviews = JSON.parse(
    fs.readFileSync(`${__dirname}/data/reviews.json`, 'utf-8')
);

const importReviewData = async () => {
    try {
        await Review.create(reviews, { validateBeforeSave: false });
        console.log('added all');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

const deleteReviewData = async () => {
    try {
        await Review.deleteMany();
        console.log('deleted all');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

const users = JSON.parse(
    fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8')
);

const importUserData = async () => {
    try {
        await User.create(users, { validateBeforeSave: false });
        console.log('added all');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

const deleteUserData = async () => {
    try {
        await User.deleteMany();
        console.log('deleted all');
        process.exit();
    } catch (err) {
        console.log(err);
    }
};

if (process.argv[2] === '--import') {
    importData();
    importReviewData();
    importUserData();
} else if (process.argv[2] === '--delete') {
    deleteData();
    deleteReviewData();
    deleteUserData();
}

// console.log(process.argv);
