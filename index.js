require('dotenv').config();
const express = require('express');
const { StatusCodes } = require("http-status-codes");
const bodyParser = require('body-parser');
const connectDB = require("./db/Connect.js");
const tradeRoutes = require('./routes/Router.js');


const app = express();

app.use(bodyParser.json());

app.use('/v1', tradeRoutes);


app.use('/', (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({ status: false, message: 'Sorry, Endpoint does not exist!' });
});


app.use((err, req, res, next) => {
    if (err) {
        res.status(err.statusCode || err.status || StatusCodes.INTERNAL_SERVER_ERROR).send(err.data || err.message || {});
    } else {
        next();
    }
});

const port = process.env.PORT || 5000;

/**
 * Asynchronous function to start the server after connecting to the database.
 *
 * @return {Promise<void>} Promise that resolves after the server has started
 */
const start = async () => {
    try {
        await connectDB(process.env.MONGODB_URI);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    } catch (error) {
        console.log("error =>", error);
    }
}

start();