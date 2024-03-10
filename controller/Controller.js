const { StatusCodes } = require("http-status-codes");
const { Portfolio } = require('../models/PortfolioModel.js');
const { Stock } = require('../models/StockModel.js');
const { Transaction } = require('../models/TransactionModel.js');
const { User } = require('../models/UserModel.js');
const { checkApikey, saveTransaction, getProfit } = require('../utils/Util.js');


/**
 * Get the API key for a user based on the provided username and password.
 *
 * @param {Object} req - The request object containing headers with username and password
 * @param {Object} res - The response object to send the API key or error message
 * @return {Promise} A Promise that resolves with the API key or rejects with an error message
 */
const getApiKey = async (req, res) => {
    const { username, password } = req.headers;
    if (!username || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Request expects `username` and `password`' });
    };
    try {
        let user = await User.findOne({ username, password });
        if (!user) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'User Not found' });
        };
        return res.status(StatusCodes.OK).json({ success: true, apikey: user.apikey });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    };
};


/**
 * Retrieves stocks from the database and sends the data as a response.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Promise<void>} the result of the function execution
 */
const getStocks = async (req, res) => {
    let { apikey } = req.body;
    const validate = await checkApikey(apikey);
    if (!validate) {
        return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Authentication Error' });
    }
    try {
        let stocks = await Stock.find({}, { __v: 0, updatedAt: 0 });
        let resData = stocks.map(stock => ({ _id: stock._id, name: stock.name, price: stock.price, createdAt: stock.createdAt }))
        return res.status(StatusCodes.OK).json({ success: true, data: resData });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, data: error });
    };
};


/**
 * Asynchronously adds a new stock to the database or updates an existing one based on the provided request body.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Promise} a Promise that resolves once the stock is added or updated
 */
const addStock = async (req, res) => {
    const { name, price, apikey } = req.body;
    if (!name || price || !apikey) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Request expects name, price, apikey' });
    };
    try {
        const validate = await checkApikey(apikey);
        if (!validate) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Authentication Error' });
        };
        let stock = await Stock.findOne({ name });
        if (!stock) {
            stock = await Stock.create({ name, price });
            return res.status(StatusCodes.CREATED).json({ success: true, message: 'Stock created successfully' });
        };
        stock.price = price;
        await stock.save();
        return res.status(StatusCodes.OK).json({ success: true, message: 'Stock updated successfully' });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    };
};


/**
 * Add a new trade based on the request body parameters.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Promise} a promise that resolves to the result of the trade addition
 */
const addTrade = async (req, res) => {
    const { stockId, quantity, type, apikey } = req.body;
    if (!stockId || !quantity || quantity <= 0 || !type || !apikey) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Request expects stockId, quantity, type, apikey' });
    };
    try {
        const validate = await checkApikey(apikey);
        if (!validate) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Authentication Error' });
        };
        let stock = await Stock.findById(stockId);
        if (!stock) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: `No stock found with id: ${stockId}` });
        };
        let tradeExists = await Portfolio.findOne({ stockId });
        if (tradeExists !== null) {
            return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Trade already exists' });
        };
        let transaction = { stock: stockId, type: type, rate: stock.price, quantity };
        let saveCurrentTransaction = await saveTransaction(transaction);
        if (!saveCurrentTransaction) {
            return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ success: false, message: 'Error making transaction' });
        };
        let portfolio = new Portfolio({ price: stock.price, quantity, stock: stockId, });
        let data = await portfolio.save();
        return res.status(StatusCodes.CREATED).json({ success: true, message: 'Trade successful', data: data });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    };
};

/**
 * Modify a trade based on the request body parameters.
 *
 * @param {object} req - the request object
 * @param {object} res - the response object
 * @return {Promise} a Promise that resolves with the trade modification result
 */
const modifyTrade = async (req, res) => {
    const { portfolioId } = req.params;
    const { quantity, type, apikey } = req.body;
    if (!portfolioId || !quantity || quantity <= 0 || !type || !apikey) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Request expects portfolioId, quantity, type(BUY or SELL), apikey' });
    };
    if (type !== "BUY" && type !== "SELL") {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Request expects type (BUY or SELL)' });
    };
    try {
        const validate = await checkApikey(apikey);
        if (!validate) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Authentication Error' });
        };
        let portfolioExists = await Portfolio.load(portfolioId);
        if (!portfolioExists) {
            return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: `No portfolio exists with id ${portfolioId}` });
        };
        let transaction = { stock: portfolioExists.stock._id, type: type, rate: portfolioExists.stock.price, quantity };
        let saveCurrentTransaction = await saveTransaction(transaction);
        if (!saveCurrentTransaction) {
            return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ success: false, message: 'Error in making a transaction' });
        };
        let updatedData = {};
        if (type === "BUY") {
            updatedData = { quantity: +portfolioExists.quantity + +quantity };
        } else {
            updatedData = { quantity: +portfolioExists.quantity - +quantity };
        }
        await Portfolio.findByIdAndUpdate(portfolioId, { ...updatedData });
        return res.status(StatusCodes.CREATED).json({ success: true, data: portfolioExists, message: 'Trade updated' });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    };
};


/**
 * Delete a trade from the portfolio based on the given parameters.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Promise} a promise that resolves to the result of the trade deletion
 */
const deleteTrade = async (req, res) => {
    const { portfolioId } = req.params;
    const { quantity, apikey } = req.body;
    if (!portfolioId || !quantity || quantity <= 0 || !apikey) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Request expects param portfolioId, quantity, apikey' });
    };
    try {
        const validate = await checkApikey(apikey);
        if (!validate) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Authentication Error' });
        };
        let portfolioExists = await Portfolio.load(portfolioId);
        if (!portfolioExists) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: `No portfolio exists with id ${portfolioId}` });
        };
        let transaction = { stock: portfolioExists.stock._id, type: 'SELL', rate: portfolioExists.stock.price, quantity };
        let saveCurrentTransaction = await saveTransaction(transaction);
        if (!saveCurrentTransaction) {
            return res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({ success: false, message: 'Error in making a transaction' });
        };
        let portfolio = {};
        if (+quantity > +portfolioExists.quantity) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'You don\'t have enough stocks to sell' });
        } else if (+quantity === +portfolioExists.quantity) {
            portfolio = await Portfolio.findByIdAndRemove(portfolioId);
        } else {
            let updatedData = { quantity: portfolioExists.quantity - quantity };
            portfolio = await Portfolio.findByIdAndUpdate(portfolioId, updatedData);
            Object.assign(Portfolio, updatedData);
        };
        return res.status(StatusCodes.CREATED).json({ success: true, data: portfolio, message: 'Trade successfully removed' });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    };
};




/**
 * Retrieves the portfolio information for the given API key.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Promise} a Promise that resolves with the portfolio information or rejects with an error
 */
const getPortfolio = async (req, res) => {
    const { apikey } = req.body;
    if (!apikey) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Request expects apikey' });
    }
    try {
        const validate = await checkApikey(apikey);
        if (!validate) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Authentication Error' });
        }
        let stocks = await Stock.loadAll();
        stocks = JSON.parse(JSON.stringify(stocks));
        const portfolioPromise = stocks.map(async v => {
            let p = await Portfolio.findOne({ stock: v._id });
            if (p) {
                let t = await Transaction.find({ stock: v._id }).populate('stock', '_id name price');
                let transactions = t.map(trx => ({ "name": v.name, "type": trx.type, "quantity": trx.quantity, "price": trx.rate, "date": trx.createdAt }));
                return transactions;
            }
            return null;
        });
        let portfolios = await Promise.all(portfolioPromise);
        portfolios = portfolios.filter(p => p !== null);
        let mergedPortfolios = portfolios.reduce((acc, val) => acc.concat(val), []);
        return res.status(StatusCodes.OK).json({ success: true, data: { portfolio: mergedPortfolios } });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    }
};



/**
 * Async function to get holdings based on the provided API key.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Promise} the result of the async operation
 */
const getHoldings = async (req, res) => {
    const { apikey } = req.body;
    if (!apikey) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Request expects apikey' });
    };
    try {
        const validate = await checkApikey(apikey);
        if (!validate) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Authentication Error' });
        };
        let portfolio = await Portfolio.loadAll();
        let data = await Promise.all(portfolio.map(async (v) => {
            const buyTransactions = await Transaction.find({ stock: v.stock._id, type: 'BUY' });
            const avgbuy = buyTransactions.length > 0 ? buyTransactions.map(t => t.rate).reduce((a, b) => a + b) / buyTransactions.length : null;
            return { name: (v.stock || {}).name, quantity: v.quantity, avgbuy };
        }));
        data = { holdings: data };
        return res.status(StatusCodes.OK).json({ success: true, data: data });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    };
};


/**
 * Retrieves the cumulative return based on the provided API key and portfolio data.
 *
 * @param {Object} req - the request object
 * @param {Object} res - the response object
 * @return {Promise} a JSON response containing the cumulative return data
 */
const getCumulativeReturn = async (req, res) => {
    const { apikey } = req.body;
    if (!apikey) {
        return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Request expects apikey' });
    };
    try {
        const validate = await checkApikey(apikey);
        if (!validate) {
            return res.status(StatusCodes.FORBIDDEN).json({ success: false, message: 'Authentication Error' });
        };
        let portfolio = await Portfolio.find();
        let stocks = await Stock.find({ _id: { $in: portfolio.map(p => p.stock) } });
        stocks = JSON.parse(JSON.stringify(stocks));
        let sum = getProfit(portfolio, stocks);
        return res.status(StatusCodes.OK).json({ success: true, data: { returns: sum } });
    } catch (error) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, error: error.message });
    };
};


module.exports = {
    addTrade,
    addStock,
    deleteTrade,
    getApiKey,
    getCumulativeReturn,
    getStocks,
    getHoldings,
    getPortfolio,
    modifyTrade
};