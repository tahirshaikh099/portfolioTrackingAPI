const mongoose = require('mongoose');
const { Schema } = mongoose;

const stockSchema = new Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    portfolio: [{ type: Schema.Types.ObjectId, ref: 'Portfolio' }],
    transaction: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }] },
    { timestamps: true });


stockSchema.statics = {

    loadAll: function () {
        return this.find().populate('portfolio').populate('transaction').exec();
    },

    load: function (_id) {
        return this.findOne({ _id }).populate('portfolio').populate('transaction').exec();
    },
};

const Stock = mongoose.model('Stock', stockSchema);

module.exports = { Stock };