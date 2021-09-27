const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const tourModel = require('./../../models/tourModel')
const Review = require('./../../models/reviewModel')
const User = require('./../../models/userModel')


dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
    console.log('DB connection sucessfull')
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));


const importData = async () => {
    try {
        await tourModel.create(tours)
        await User.create(users, {validateBeforeSave: false})
        await Review.create(reviews)
        console.log('Data added')
        process.exit()

    } catch (err) {
        console.log(err)
    }
}
const deleteData = async () => {
    try {
        await tourModel.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log('Data deleted')
        process.exit()

    } catch (err) {
        console.log(err)
    }
}
if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}
