const mongoose = require("mongoose");

//This function takes a url parameter and uses it to connect to database using the provided URL.
const connectDB = (url) => {
    return mongoose.connect(url);
};

module.exports = connectDB;