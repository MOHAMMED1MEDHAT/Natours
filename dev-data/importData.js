require('dotenv').config({ path: './../config.env' });
const fs = require('fs');
const Tour = require('./../model/tourModel');
const mongoose = require('mongoose');

mongoose
    .connect(process.env.LOCAL_CONNECTION_STRING, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: 'Natours',
    })
    .then(() => {
        console.log('Connected to db');
    })
    .catch((err) => console.log('error occured' + err));

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/data/${process.argv[2]}.json`, 'utf-8')
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

if (process.argv[3] === '--import') {
    importData();
} else if (process.argv[3] === '--delete') {
    deleteData();
}

// console.log(process.argv);
