const { Transaction } = require('../models/TransactionModel.js');
const { User } = require('../models/UserModel.js');

/**
 * Check the API key to find the corresponding user.
 *
 * @param {string} apikey - The API key to be checked
 * @return {Promise<object|boolean>} The user object if the API key is valid, false if not
 */
const checkApikey = async (apikey) => {
    try {
        const user = await User.findOne({ apikey });
        return user;
    } catch (error) {
        console.error("Error checking API key:", error);
        return false;
    }
};


/**
 * Saves a transaction into the database.
 *
 * @param {Object} transaction - the transaction to be saved
 * @return {Promise} the saved transaction data or an error
 */
const saveTransaction = async (transaction) => {
    try {
        let data = await Transaction.create(transaction);
        return data;
    } catch (error) {
        return error;
    };
};



/**
 * Calculates the cumulative profit of the portfolio
 * @param {Object[]} portfolio - the portfolio data
 * @returns {number} the cumulative profit
 */
const getProfit = (portfolio, stocks) => {
    let sum = 0;
    stocks.map(s => {
        let p = portfolio.find(p => p.stock == s._id);
        if (p) {
            sum += (p.quantity * s.price);
        }
    });
    return sum;
};

module.exports = { checkApikey, saveTransaction, getProfit }