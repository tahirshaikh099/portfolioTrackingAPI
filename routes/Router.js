const express = require('express');
const router = express.Router();


// Importing controller function for each route
const {
    addTrade,
    addStock,
    deleteTrade,
    getApiKey,
    getCumulativeReturn,
    getStocks,
    getHoldings,
    getPortfolio,
    modifyTrade } = require('../controller/Controller.js');

// HTTP GET calls
router.route('/portfolio').get(getPortfolio);
router.route('/holdings').get(getHoldings);
router.route('/returns').get(getCumulativeReturn);
router.route('/getStocks').get(getStocks);
router.route('/getApiKey').get(getApiKey);

// HTTP POST calls
router.route('/addTrade').post(addTrade);
router.route('/addStocks').post(addStock);

// HTTP PUT calls
router.route('/updateTrade/:portfolioId').put(modifyTrade);

// HTTP DELETE calls
router.route('/removeTrade/:portfolioId').delete(deleteTrade);



module.exports = router;