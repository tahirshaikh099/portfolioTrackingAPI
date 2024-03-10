const mongoose = require('mongoose');
const { Schema } = mongoose;

const portfolioSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    price: Number,
    quantity: Number,
    stock: { type: Schema.Types.ObjectId, ref: 'Stock', required: true }},
    { timestamps: true });

portfolioSchema.statics = {
    loadAll: function () {
        return this.find().populate('stock', '_id name price').exec();
    },
    load: function (_id) {
        return this.findOne({ _id }).populate('stock', '_id name price').exec();
    },
};


const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = { Portfolio };
