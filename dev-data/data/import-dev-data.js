const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const tourModel = require('./../../models/tourModel')

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(con => {
    console.log('DB connection sucessfull')
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

const importData = async () => {
    try {
        await tourModel.create(tours)
        console.log('Data added')
        process.exit()

    } catch (err) {
        console.log(err)
    }
}
const deleteData = async () => {
    try {
        await tourModel.deleteMany()
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
